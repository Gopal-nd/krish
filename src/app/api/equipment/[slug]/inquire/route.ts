import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createEquipmentWhatsAppLink,
  WHATSAPP_TEMPLATES,
  EQUIPMENT_CATEGORY_TEMPLATES,
  formatPhoneNumber
} from "@/lib/whatsapp";
import { createErrorResponseNext, Errors, validate } from "@/lib/errors";

interface RouteParams {
  params: { slug: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const user = await getCurrentUser();

    if (!user) {
      return createErrorResponseNext(Errors.Unauthorized("You must be logged in to send inquiries"));
    }

    const body = await request.json();
    const { message } = body;

    // Validate required fields
    validate.required(message, "message");
    validate.stringLength(message, "message", 10, 1000);

    // Find equipment by slug first to get the ID
    const equipment = await db.equipment.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        condition: true,
        location: true,
        category: true,
        sellerId: true,
        seller: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true
          }
        }
      }
    });

    if (!equipment) {
      return createErrorResponseNext(Errors.NotFound("Equipment"));
    }

    // Check if user is trying to inquire about their own equipment
    if (equipment.sellerId === user.id) {
      return createErrorResponseNext(Errors.OperationNotAllowed(
        "inquiry",
        "You cannot inquire about your own equipment"
      ));
    }

    // Check if inquiry already exists
    const existingInquiry = await db.equipmentInquiry.findUnique({
      where: {
        buyerId_equipmentId: {
          buyerId: user.id,
          equipmentId: equipment.id
        }
      }
    });

    if (existingInquiry) {
      return createErrorResponseNext(Errors.Conflict(
        "You have already sent an inquiry for this equipment",
        { equipmentId: equipment.id }
      ));
    }

    // Create inquiry
    const inquiry = await db.equipmentInquiry.create({
      data: {
        message,
        buyerId: user.id,
        sellerId: equipment.sellerId,
        equipmentId: equipment.id
      },
      include: {
        equipment: {
          select: {
            id: true,
            title: true,
            condition: true,
            location: true,
            category: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true
          }
        }
      }
    });

    // Generate WhatsApp link if seller has phone number
    let whatsappLink = null;
    if (equipment.seller.whatsappNumber) {
      const categoryKey = EQUIPMENT_CATEGORY_TEMPLATES[equipment.category] || 'default';
      const categoryTemplates = WHATSAPP_TEMPLATES[categoryKey];

      // Use the inquiry template for the specific category
      const inquiryMessage = typeof categoryTemplates === 'object'
        ? categoryTemplates.inquiry || WHATSAPP_TEMPLATES.default.inquiry
        : WHATSAPP_TEMPLATES.default.inquiry;

      const formattedMessage = inquiryMessage
        .replace('{condition}', equipment.condition.toLowerCase())
        .replace('{title}', equipment.title)
        .replace('{location}', equipment.location);

      whatsappLink = `https://wa.me/${formatPhoneNumber(equipment.seller.whatsappNumber)}?text=${encodeURIComponent(formattedMessage)}`;
    }

    return NextResponse.json({
      inquiry,
      whatsappLink,
      message: "Inquiry sent successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating inquiry:", error);
    return createErrorResponseNext(error as Error);
  }
}
