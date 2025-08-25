import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { EquipmentCondition, UserRole } from "@prisma/client";

interface RouteParams {
  params: { slug: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const user = await getCurrentUser();

    const equipment = await db.equipment.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsappNumber: true,
            role: true
          }
        },
        inquiries: {
          where: { status: "NEW" },
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        },
        certifications: {
          select: {
            id: true,
            certificationNumber: true,
            standard: true,
            certifyingBody: true,
            issueDate: true,
            expiryDate: true,
            documentUrl: true,
            status: true
          }
        }
      }
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Not Found", message: "Equipment not found" },
        { status: 404 }
      );
    }

    // Check if user can view this equipment (owner or public)
    if (user?.id !== equipment.sellerId && user?.role !== UserRole.FARMER) {
      // For now, allow viewing, but restrict editing
      return NextResponse.json({
        ...equipment,
        canEdit: false
      });
    }

    return NextResponse.json({
      ...equipment,
      canEdit: user?.id === equipment.sellerId
    });

  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to update equipment" },
        { status: 401 }
      );
    }

    requireRole(user, UserRole.FARMER);

    const body = await request.json();
    const { title, description, priceCents, currency, images, category, condition, location } = body;

    // Find equipment by slug first to get the ID
    const existingEquipment = await db.equipment.findUnique({
      where: { slug },
      select: { id: true, sellerId: true }
    });

    if (!existingEquipment) {
      return NextResponse.json(
        { error: "Not Found", message: "Equipment not found" },
        { status: 404 }
      );
    }

    if (existingEquipment.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only update your own equipment" },
        { status: 403 }
      );
    }

    // Validate condition enum if provided
    if (condition && !Object.values(EquipmentCondition).includes(condition)) {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid equipment condition" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priceCents !== undefined) updateData.priceCents = parseInt(priceCents);
    if (currency !== undefined) updateData.currency = currency;
    if (images !== undefined) updateData.images = images;
    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    if (location !== undefined) updateData.location = location;

    const equipment = await db.equipment.update({
      where: { id: existingEquipment.id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(equipment);

  } catch (error) {
    console.error("Error updating equipment:", error);

    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: "Forbidden", message: "Only farmers can update equipment" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update equipment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to delete equipment" },
        { status: 401 }
      );
    }

    requireRole(user, UserRole.FARMER);

    // Find equipment by slug first to get the ID
    const existingEquipment = await db.equipment.findUnique({
      where: { slug },
      select: { id: true, sellerId: true }
    });

    if (!existingEquipment) {
      return NextResponse.json(
        { error: "Not Found", message: "Equipment not found" },
        { status: 404 }
      );
    }

    if (existingEquipment.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only delete your own equipment" },
        { status: 403 }
      );
    }

    // Delete all related inquiries first to avoid foreign key constraint violation
    await db.equipmentInquiry.deleteMany({
      where: { equipmentId: existingEquipment.id }
    });

    // Now delete the equipment
    await db.equipment.delete({
      where: { id: existingEquipment.id }
    });

    return NextResponse.json({ message: "Equipment deleted successfully" });

  } catch (error) {
    console.error("Error deleting equipment:", error);

    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: "Forbidden", message: "Only farmers can delete equipment" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
