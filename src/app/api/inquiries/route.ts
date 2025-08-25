import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to view inquiries" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'sent' for buyers, 'received' for sellers
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let whereClause: any = {};
    let includeClause: any = {};

    if (type === "sent") {
      // Buyer viewing their sent inquiries
      whereClause.buyerId = user.id;
      includeClause = {
        equipment: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                whatsappNumber: true
              }
            }
          }
        },
        seller: {
          select: {
            id: true,
            name: true
          }
        }
      };
    } else if (type === "received") {
      // Seller viewing inquiries about their equipment
      whereClause.sellerId = user.id;
      includeClause = {
        equipment: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsappNumber: true
          }
        }
      };
    } else {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid inquiry type. Use 'sent' or 'received'" },
        { status: 400 }
      );
    }

    if (status) {
      whereClause.status = status;
    }

    const inquiries = await db.equipmentInquiry.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit
    });

    const totalCount = await db.equipmentInquiry.count({ where: whereClause });

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
