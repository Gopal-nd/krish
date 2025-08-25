import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import {
  WHATSAPP_TEMPLATES,
  EQUIPMENT_CATEGORY_TEMPLATES,
  createSellerResponseMessage,
  createAutomatedResponse,
  createEquipmentWhatsAppLink,
  formatPhoneNumber
} from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'inquiry', 'response', 'followUp'

    let templates = WHATSAPP_TEMPLATES;

    if (category) {
      const categoryKey = EQUIPMENT_CATEGORY_TEMPLATES[category] || 'default';
      templates = { [categoryKey]: WHATSAPP_TEMPLATES[categoryKey] } as any;
    }

    if (type) {
      const filteredTemplates: any = {};
      Object.entries(templates).forEach(([cat, catTemplates]) => {
        if (typeof catTemplates === 'object' && type in catTemplates) {
          filteredTemplates[cat] = { [type]: catTemplates[type as keyof typeof catTemplates]  } 
        }
      });
      templates = filteredTemplates;
    }

    return NextResponse.json({
      templates,
      categories: Object.keys(EQUIPMENT_CATEGORY_TEMPLATES),
      types: ['inquiry', 'response', 'followUp']
    });

  } catch (error) {
    console.error("Error fetching WhatsApp templates:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      equipmentId,
      templateType,
      customMessage,
      responseType,
      buyerPhone
    } = body;

    // Get equipment details
    const equipment = await db.equipment.findUnique({
      where: { id: equipmentId },
      include: { seller: true }
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Not Found", message: "Equipment not found" },
        { status: 404 }
      );
    }

    if (equipment.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only send messages for your own equipment" },
        { status: 403 }
      );
    }

    let message = customMessage || '';

    // Generate message based on template
    if (templateType && !customMessage) {
      const categoryKey = EQUIPMENT_CATEGORY_TEMPLATES[equipment.category] || 'default';
      const categoryTemplates = WHATSAPP_TEMPLATES[categoryKey];

      if (categoryTemplates && typeof categoryTemplates === 'object') {
        message = categoryTemplates[templateType as keyof typeof categoryTemplates] || '';
      }

      // Replace template variables
      message = message
        .replace('{condition}', equipment.condition.toLowerCase())
        .replace('{title}', equipment.title)
        .replace('{location}', equipment.location);
    }

    // Generate response message if responseType is provided
    if (responseType && !customMessage) {
      const inquiry = await db.equipmentInquiry.findFirst({
        where: {
          equipmentId: equipment.id,
          buyer: {
            whatsappNumber: buyerPhone
          }
        }
      });

      message = createSellerResponseMessage(
        {
          title: equipment.title,
          condition: equipment.condition,
          priceCents: equipment.priceCents,
          currency: equipment.currency
        },
        { message: inquiry?.message as string},
        equipment.seller.name || 'Seller',
        responseType
      );
    }

    // Generate WhatsApp link if buyer phone is provided
    let whatsappLink = null;
    if (buyerPhone && message) {
      whatsappLink = createEquipmentWhatsAppLink(
        {
          title: equipment.title,
          condition: equipment.condition,
          location: equipment.location,
          category: equipment.category
        },
        buyerPhone,
        equipment.seller.name || 'Seller'
      );
    }

    return NextResponse.json({
      message,
      whatsappLink,
      equipment: {
        id: equipment.id,
        title: equipment.title,
        condition: equipment.condition,
        category: equipment.category
      }
    });

  } catch (error) {
    console.error("Error generating WhatsApp template:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to generate template" },
      { status: 500 }
    );
  }
}
