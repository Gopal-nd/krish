import { db } from "./db";
import { InquiryStatus } from "@prisma/client";
import {
  createWhatsAppBusinessPayload,
  createAutomatedResponse,
  createSellerResponseMessage,
  parseWhatsAppMessageStatus,
  isValidWhatsAppNumber,
  formatPhoneNumber
} from "./whatsapp";

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          button?: {
            text: string;
            payload: string;
          };
          interactive?: any;
        }>;
      };
      field: string;
    }>;
  }>;
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Processes incoming WhatsApp webhook messages
   */
  async processWebhookMessage(payload: WhatsAppWebhookPayload): Promise<void> {
    try {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const { value } = change;

          if (value.messages) {
            for (const message of value.messages) {
              await this.processMessage(message, value.contacts[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
    }
  }

  /**
   * Processes individual WhatsApp messages
   */
  private async processMessage(
    message: any,
    contact: { profile: { name: string }; wa_id: string }
  ): Promise<void> {
    const senderPhone = message.from;
    const messageText = message.text?.body || '';

    // Find user by WhatsApp number
    const user = await db.user.findFirst({
      where: { whatsappNumber: senderPhone },
      select: { id: true, name: true, role: true }
    });

    if (!user) {
      console.log(`User not found for WhatsApp number: ${senderPhone}`);
      return;
    }

    // Parse message to determine intent
    const messageStatus = parseWhatsAppMessageStatus(messageText);

    // Update inquiry status based on message
    await this.updateInquiryStatus(user.id, messageStatus, messageText);

    // Generate automated response if needed
    const response = await this.generateAutomatedResponse(user.id, messageStatus, messageText);
    if (response) {
      await this.sendWhatsAppMessage(senderPhone, response);
    }
  }

  /**
   * Updates inquiry status based on WhatsApp message content
   */
  private async updateInquiryStatus(
    userId: string,
    status: string,
    messageText: string
  ): Promise<void> {
    try {
      // Find the most recent inquiry for this user
      const recentInquiry = await db.equipmentInquiry.findFirst({
        where: {
          buyerId: userId,
          status: { in: ['NEW', 'CONTACTED', 'IN_DISCUSSION'] }
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (recentInquiry) {
        let newStatus: InquiryStatus = recentInquiry.status;

        switch (status) {
          case 'interested':
            newStatus = 'CONTACTED';
            break;
          case 'negotiating':
            newStatus = 'IN_DISCUSSION';
            break;
          case 'purchasing':
            newStatus = 'PURCHASED';
            break;
          case 'declined':
            newStatus = 'CLOSED';
            break;
        }

        if (newStatus !== recentInquiry.status) {
          await db.equipmentInquiry.update({
            where: { id: recentInquiry.id },
            data: {
              status: newStatus,
              whatsappMessageSent: true
            }
          });
        }
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  }

  /**
   * Generates automated responses based on message content
   */
  private async generateAutomatedResponse(
    userId: string,
    messageStatus: string,
    messageText: string
  ): Promise<string | null> {
    try {
      // Find the most recent inquiry for this user
      const recentInquiry = await db.equipmentInquiry.findFirst({
        where: {
          buyerId: userId,
          status: { in: ['NEW', 'CONTACTED', 'IN_DISCUSSION'] }
        },
        include: {
          equipment: true,
          seller: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (!recentInquiry) return null;

      const equipment = recentInquiry.equipment;
      const seller = recentInquiry.seller;

      // Generate response based on message content
      const lowerMessage = messageText.toLowerCase();

      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
        return createAutomatedResponse('price_request', equipment, seller.name || undefined);
      }

      if (lowerMessage.includes('condition') || lowerMessage.includes('working') || lowerMessage.includes('status')) {
        return createAutomatedResponse('condition_request', equipment, seller.name || undefined);
      }

      if (lowerMessage.includes('delivery') || lowerMessage.includes('pickup') || lowerMessage.includes('transport')) {
        return createAutomatedResponse('delivery_request', equipment, seller.name || undefined);
      }

      if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return createAutomatedResponse('thank_you', equipment, seller.name || undefined);
      }

      // Default response for other inquiries
      return `Hello! Thank you for your message about my ${equipment.condition.toLowerCase()} ${equipment.title}. I'm here to help with any questions you have. Feel free to ask about the price, condition, or any other details.\n\nBest regards,\n${seller.name || 'Seller'}`;

    } catch (error) {
      console.error('Error generating automated response:', error);
      return null;
    }
  }

  /**
   * Sends WhatsApp message using Business API
   */
  async sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        console.warn('WhatsApp Business API not configured');
        return false;
      }

      const formattedNumber = formatPhoneNumber(to);
      if (!formattedNumber) {
        console.error('Invalid WhatsApp number:', to);
        return false;
      }

      const payload = createWhatsAppBusinessPayload(formattedNumber, message);

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('WhatsApp API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('WhatsApp message sent:', result);
      return true;

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Sends bulk WhatsApp messages to multiple recipients
   */
  async sendBulkWhatsAppMessages(
    messages: Array<{ to: string; message: string }>
  ): Promise<Array<{ to: string; success: boolean; messageId?: string }>> {
    const results = [];

    for (const { to, message } of messages) {
      try {
        const success = await this.sendWhatsAppMessage(to, message);
        results.push({ to, success });
      } catch (error) {
        console.error(`Error sending message to ${to}:`, error);
        results.push({ to, success: false });
      }
    }

    return results;
  }

  /**
   * Validates WhatsApp Business API configuration
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }

  /**
   * Gets WhatsApp Business API status
   */
  async getWhatsAppStatus(): Promise<{
    configured: boolean;
    phoneNumberId: string;
    businessAccountId?: string;
  }> {
    return {
      configured: this.isConfigured(),
      phoneNumberId: this.phoneNumberId,
    };
  }
}

// Export singleton instance
export const whatsAppService = WhatsAppService.getInstance();
