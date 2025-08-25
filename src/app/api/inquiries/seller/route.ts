import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole, InquiryStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to view inquiries" },
        { status: 401 }
      );
    }

    requireRole(user, UserRole.FARMER);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const equipmentId = searchParams.get("equipmentId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let whereClause: any = {
      sellerId: user.id
    };

    if (status && Object.values(InquiryStatus).includes(status as InquiryStatus)) {
      whereClause.status = status as InquiryStatus;
    }

    if (equipmentId) {
      whereClause.equipmentId = equipmentId;
    }

    const inquiries = await db.equipmentInquiry.findMany({
      where: whereClause,
      include: {
        equipment: {
          select: {
            id: true,
            title: true,
            condition: true,
            location: true,
            category: true,
            priceCents: true,
            currency: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsappNumber: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit
    });

    const totalCount = await db.equipmentInquiry.count({ where: whereClause });

    // Get inquiry statistics
    const stats = await db.equipmentInquiry.groupBy({
      by: ["status"],
      where: { sellerId: user.id },
      _count: {
        id: true
      }
    });

    const statistics = {
      new: stats.find(s => s.status === "NEW")?._count.id || 0,
      contacted: stats.find(s => s.status === "CONTACTED")?._count.id || 0,
      inDiscussion: stats.find(s => s.status === "IN_DISCUSSION")?._count.id || 0,
      closed: stats.find(s => s.status === "CLOSED")?._count.id || 0,
      purchased: stats.find(s => s.status === "PURCHASED")?._count.id || 0,
      total: totalCount
    };

    return NextResponse.json({
      inquiries,
      statistics,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching seller inquiries:", error);

    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: "Forbidden", message: "Only farmers can view seller inquiries" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to update inquiries" },
        { status: 401 }
      );
    }

    requireRole(user, UserRole.FARMER);

    const body = await request.json();
    const { inquiryId, status, response } = body;

    if (!inquiryId || !status) {
      return NextResponse.json(
        { error: "Validation Error", message: "Missing required fields: inquiryId, status" },
        { status: 400 }
      );
    }

    if (!Object.values(InquiryStatus).includes(status)) {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid inquiry status" },
        { status: 400 }
      );
    }

    // Check if inquiry exists and belongs to seller
    const inquiry = await db.equipmentInquiry.findUnique({
      where: { id: inquiryId },
      select: {
        id: true,
        sellerId: true,
        equipment: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Not Found", message: "Inquiry not found" },
        { status: 404 }
      );
    }

    if (inquiry.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only update inquiries for your own equipment" },
        { status: 403 }
      );
    }

    // Update inquiry status
    const updatedInquiry = await db.equipmentInquiry.update({
      where: { id: inquiryId },
      data: {
        status: status as InquiryStatus,
        ...(response && { message: `${inquiry.equipment.title}: ${response}` })
      },
      include: {
        equipment: {
          select: {
            id: true,
            title: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      inquiry: updatedInquiry,
      message: "Inquiry status updated successfully"
    });

  } catch (error) {
    console.error("Error updating inquiry:", error);

    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: "Forbidden", message: "Only farmers can update inquiries" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
