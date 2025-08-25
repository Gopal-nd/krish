import { EquipmentCondition } from "@prisma/client";
import { formatPrice } from "./utils";

// WhatsApp message templates for different equipment categories
export const WHATSAPP_TEMPLATES = {
  tractor: {
    inquiry: "Hi! I'm interested in your {condition} {title} in {location}. Could you please provide more details about:\n• Current condition and usage hours\n• Price and payment terms\n• Delivery/pickup options\n• Service history if available\n\nLooking forward to your response!",
    response: "Thank you for your interest in my {condition} {title}! Regarding your questions about condition, usage, and price - I'd be happy to provide more details. Please let me know what specific information you need.",
    followUp: "Hi! I wanted to follow up on my inquiry about your {condition} {title}. Are you still available for discussion? I'd love to know more about the equipment condition and pricing."
  },
  harvester: {
    inquiry: "Hello! I saw your {condition} {title} for sale in {location}. Can you share more information about:\n• Harvesting capacity and efficiency\n• Current condition and maintenance\n• Price and any negotiable terms\n• Operating hours and fuel consumption\n\nThank you!",
    response: "Thank you for your interest in my {condition} {title}! I'd be glad to discuss the harvesting capacity, condition, and pricing. What specific details would help you make a decision?",
    followUp: "Hi! Following up on my inquiry about your {condition} {title}. I'm very interested in the harvesting capacity and would like to discuss pricing. Are you available to chat?"
  },
  tiller: {
    inquiry: "Hi there! I'm looking for a {condition} {title}. Is your equipment in {location} still available? Please share:\n• Tilling depth and width capacity\n• Engine power and fuel type\n• Current condition and maintenance\n• Price and warranty information\n\nThanks!",
    response: "Thank you for your interest in my {condition} {title}! I can provide details about the tilling capacity, engine specifications, and condition. What would you like to know first?",
    followUp: "Hello! I wanted to follow up regarding your {condition} {title}. I'm particularly interested in the tilling capacity and engine power. Could we discuss the pricing and condition?"
  },
  irrigation: {
    inquiry: "Hello! Your {condition} {title} in {location} caught my attention. Could you provide more details about:\n• Water flow capacity and coverage area\n• Current condition and any repairs needed\n• Energy requirements and efficiency\n• Price and installation support\n\nLooking forward to your response!",
    response: "Thank you for your interest in my {condition} {title}! I can share information about the water capacity, efficiency, and condition. Please let me know what specific details you need.",
    followUp: "Hi! Following up on my inquiry about your {condition} {title}. I'm very interested in the water capacity and efficiency. Could we discuss the pricing and current condition?"
  },
  seeder: {
    inquiry: "Hi! I'm interested in your {condition} {title} in {location}. Could you please provide more details about:\n• Seeding capacity and row spacing\n• Current condition and calibration\n• Price and delivery options\n• Seed types it's compatible with\n\nThank you!",
    response: "Thank you for your interest in my {condition} {title}! I'd be happy to discuss the seeding capacity, condition, and compatibility. What specific information would help you?",
    followUp: "Hello! Following up on my inquiry about your {condition} {title}. I'm interested in the seeding capacity and would like to discuss pricing and condition."
  },
  sprayer: {
    inquiry: "Hi there! I'm looking for a {condition} {title}. Is your equipment in {location} still available? Please share:\n• Spraying capacity and tank size\n• Current condition and any repairs\n• Price and warranty information\n• Compatible chemicals/pesticides\n\nThanks!",
    response: "Thank you for your interest in my {condition} {title}! I can provide details about the spraying capacity, tank size, and condition. What would you like to know first?",
    followUp: "Hi! Following up on my inquiry about your {condition} {title}. I'm particularly interested in the spraying capacity and tank size. Could we discuss pricing?"
  },
  plow: {
    inquiry: "Hello! I saw your {condition} {title} for sale in {location}. Can you share more information about:\n• Plowing depth and width capacity\n• Current condition and blade status\n• Price and any negotiable terms\n• Compatible tractor requirements\n\nThank you!",
    response: "Thank you for your interest in my {condition} {title}! I'd be glad to discuss the plowing capacity, blade condition, and compatibility. What specific details would help you?",
    followUp: "Hi! Following up on my inquiry about your {condition} {title}. I'm very interested in the plowing capacity and would like to discuss pricing and condition."
  },
  cultivator: {
    inquiry: "Hi! I'm interested in your {condition} {title} in {location}. Could you please provide more details about:\n• Cultivation depth and working width\n• Current condition and maintenance\n• Price and delivery options\n• Soil types it's best suited for\n\nLooking forward to your response!",
    response: "Thank you for your interest in my {condition} {title}! I can share information about the cultivation capacity, condition, and soil compatibility. What would you like to know first?",
    followUp: "Hello! Following up on my inquiry about your {condition} {title}. I'm particularly interested in the cultivation depth and would like to discuss pricing."
  },
  default: {
    inquiry: "Hi! I'm interested in your {condition} {title} in {location}. Could you please share more details about the price and condition? I'd like to know:\n• Current working condition\n• Price and payment terms\n• Delivery/pickup options\n• Any additional features or specifications\n\nThank you!",
    response: "Thank you for your interest in my {condition} {title}! I'd be happy to provide more details about the condition, specifications, and pricing. What specific information would help you make a decision?",
    followUp: "Hi! I wanted to follow up on my inquiry about your {condition} {title}. Are you still available for discussion? I'd love to know more about the equipment condition and pricing."
  }
} as const;

// Equipment category mapping for templates
export const EQUIPMENT_CATEGORY_TEMPLATES: Record<string, keyof typeof WHATSAPP_TEMPLATES> = {
  "Tractor": "tractor",
  "Harvester": "harvester",
  "Tiller": "tiller",
  "Irrigation System": "irrigation",
  "Seeder": "default",
  "Sprayer": "default",
  "Plow": "default",
  "Cultivator": "default",
  "Other": "default"
};

/**
 * Generates a WhatsApp chat URL with pre-filled message
 */
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
}

/**
 * Creates a WhatsApp message for equipment inquiry
 */
export function createEquipmentInquiryMessage(
  equipment: {
    title: string;
    condition: EquipmentCondition;
    location: string;
    category: string;
  },
  buyerName?: string
): string {
  const templateKey = EQUIPMENT_CATEGORY_TEMPLATES[equipment.category] || "default";
  const template = WHATSAPP_TEMPLATES[templateKey];

  let message = template.inquiry
    .replace("{condition}", equipment.condition.toLowerCase())
    .replace("{title}", equipment.title)
    .replace("{location}", equipment.location);

  if (buyerName) {
    message = `Hi, I'm ${buyerName}. ${message}`;
  }

  return message;
}

/**
 * Validates and formats phone number for WhatsApp
 */
export function formatPhoneNumber(phoneNumber: string): string | null {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid Indian mobile number (10 digits) or with country code (12 digits)
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly;
  } else if (digitsOnly.length === 13 && digitsOnly.startsWith('091')) {
    return digitsOnly.slice(1); // Remove leading 0
  }

  return null; // Invalid phone number
}

/**
 * Creates a direct WhatsApp contact link for equipment
 */
export function createEquipmentWhatsAppLink(
  equipment: {
    title: string;
    condition: EquipmentCondition;
    location: string;
    category: string;
  },
  sellerPhone: string,
  buyerName?: string
): string | null {
  const formattedPhone = formatPhoneNumber(sellerPhone);
  if (!formattedPhone) return null;

  const message = createEquipmentInquiryMessage(equipment, buyerName);
  return generateWhatsAppUrl(formattedPhone, message);
}

/**
 * Creates a WhatsApp business profile link
 */
export function createWhatsAppBusinessLink(phoneNumber: string): string | null {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) return null;

  return `https://wa.me/${formattedPhone}`;
}

/**
 * Checks if a phone number is valid for WhatsApp
 */
export function isValidWhatsAppNumber(phoneNumber: string): boolean {
  return formatPhoneNumber(phoneNumber) !== null;
}

/**
 * Creates a bulk WhatsApp message for multiple inquiries
 */
export function createBulkResponseMessage(
  inquiries: Array<{
    equipment: { title: string; condition: EquipmentCondition };
    buyerName?: string;
  }>,
  commonMessage: string
): string {
  const intro = `Hello! I have updates regarding ${inquiries.length} of your inquiries:\n\n`;

  const equipmentList = inquiries
    .map((inquiry, index) =>
      `${index + 1}. ${inquiry.equipment.condition} ${inquiry.equipment.title}`
    )
    .join('\n');

  return `${intro}${equipmentList}\n\n${commonMessage}`;
}

/**
 * Creates a WhatsApp response message for seller to buyer
 */
export function createSellerResponseMessage(
  equipment: { title: string; condition: EquipmentCondition; priceCents: number; currency: string },
  inquiry: { message?: string },
  sellerName: string,
  responseType: 'positive' | 'negative' | 'negotiate' | 'information' = 'positive'
): string {
  const baseMessage = `Hello! Thank you for your interest in my ${equipment.condition.toLowerCase()} ${equipment.title}.`;

  const priceFormatted = formatPrice(equipment.priceCents, equipment.currency);

  const responses = {
    positive: `${baseMessage}\n\nThe equipment is in excellent condition and priced at ${priceFormatted}. I'm happy to answer any questions you have and discuss the next steps.\n\nBest regards,\n${sellerName}`,
    negative: `${baseMessage}\n\nUnfortunately, this equipment has already been sold or is no longer available. I apologize for any inconvenience.\n\nBest regards,\n${sellerName}`,
    negotiate: `${baseMessage}\n\nThe listed price is ${priceFormatted}, but I'm open to reasonable offers. Please let me know your thoughts and we can discuss further.\n\nBest regards,\n${sellerName}`,
    information: `${baseMessage}\n\nRegarding your question "${inquiry.message || 'about the equipment'}", I'd be happy to provide more details. Please feel free to ask any specific questions you have.\n\nThe equipment is priced at ${priceFormatted}.\n\nBest regards,\n${sellerName}`
  };

  return responses[responseType];
}

/**
 * Creates automated WhatsApp responses for common scenarios
 */
export function createAutomatedResponse(
  scenario: 'unavailable' | 'price_request' | 'condition_request' | 'delivery_request' | 'thank_you',
  equipment?: { title: string; condition: EquipmentCondition; priceCents?: number; currency?: string },
  sellerName?: string
): string {
  const responses = {
    unavailable: `Hello! Thank you for your interest. Unfortunately, this equipment is no longer available as it has been sold. I apologize for any inconvenience caused.\n\nBest regards,\n${sellerName || 'Seller'}`,
    price_request: `Hello! The ${equipment?.condition.toLowerCase()} ${equipment?.title} is priced at ${equipment?.priceCents ? formatPrice(equipment.priceCents, equipment.currency) : 'the listed price'}. I'm open to discussing the price and payment terms.\n\nBest regards,\n${sellerName || 'Seller'}`,
    condition_request: `Hello! The ${equipment?.condition.toLowerCase()} ${equipment?.title} is in ${equipment?.condition === 'NEW' ? 'excellent condition with full warranty' : equipment?.condition === 'USED' ? 'good working condition with normal wear' : 'refurbished condition and fully functional'}. I'd be happy to provide more photos or answer specific questions.\n\nBest regards,\n${sellerName || 'Seller'}`,
    delivery_request: `Hello! I can arrange for delivery of the ${equipment?.condition.toLowerCase()} ${equipment?.title} to your location. Delivery costs depend on the distance and will be discussed separately. Local pickup is also available.\n\nBest regards,\n${sellerName || 'Seller'}`,
    thank_you: `Hello! Thank you for your interest in my equipment. I'm here to help with any questions you have about the ${equipment?.condition.toLowerCase()} ${equipment?.title} or the purchasing process.\n\nBest regards,\n${sellerName || 'Seller'}`
  };

  return responses[scenario];
}

/**
 * Creates WhatsApp Business API webhook payload for automated responses
 */
export function createWhatsAppBusinessPayload(
  to: string,
  message: string,
  messageType: 'text' | 'image' | 'document' = 'text'
) {
  return {
    messaging_product: "whatsapp",
    to: to,
    type: messageType,
    text: {
      body: message
    }
  };
}

/**
 * Parses WhatsApp message to determine inquiry status
 */
export function parseWhatsAppMessageStatus(message: string): 'interested' | 'negotiating' | 'purchasing' | 'declined' | 'unknown' {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('interested') || lowerMessage.includes('inquiry') || lowerMessage.includes('price') || lowerMessage.includes('details')) {
    return 'interested';
  }

  if (lowerMessage.includes('negotiate') || lowerMessage.includes('offer') || lowerMessage.includes('discount') || lowerMessage.includes('cheaper')) {
    return 'negotiating';
  }

  if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('take it') || lowerMessage.includes('sold')) {
    return 'purchasing';
  }

  if (lowerMessage.includes('not interested') || lowerMessage.includes('decline') || lowerMessage.includes('pass') || lowerMessage.includes('no thanks')) {
    return 'declined';
  }

  return 'unknown';
}

/**
 * Creates WhatsApp template messages for business verification
 */
export function createBusinessVerificationTemplate() {
  return {
    name: "equipment_marketplace_verification",
    language: "en",
    category: "UTILITY",
    components: [
      {
        type: "BODY",
        text: "Hello! Thank you for registering with Krishi Equipment Marketplace. Your account has been successfully verified. You can now start listing your agricultural equipment.",
        example: {
          body_text: [["Krishi Equipment Marketplace"]]
        }
      }
    ]
  };
}

/**
 * Creates equipment listing success template
 */
export function createListingSuccessTemplate(equipmentTitle: string, price: string) {
  return {
    name: "equipment_listing_success",
    language: "en",
    category: "TRANSACTIONAL",
    components: [
      {
        type: "BODY",
        text: `Great news! Your ${equipmentTitle} has been successfully listed on Krishi Equipment Marketplace for ${price}. Start receiving inquiries from interested buyers today!`,
        example: {
          body_text: [[equipmentTitle, price]]
        }
      }
    ]
  };
}

/**
 * Creates inquiry notification template for sellers
 */
export function createInquiryNotificationTemplate(buyerName: string, equipmentTitle: string) {
  return {
    name: "new_inquiry_notification",
    language: "en",
    category: "TRANSACTIONAL",
    components: [
      {
        type: "BODY",
        text: `You have a new inquiry from ${buyerName} about your ${equipmentTitle}. Please respond promptly to increase your chances of making a sale!`,
        example: {
          body_text: [[buyerName, equipmentTitle]]
        }
      }
    ]
  };
}
