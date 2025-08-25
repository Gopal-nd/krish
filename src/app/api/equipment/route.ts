import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { EquipmentCondition, UserRole, CertificationStandard } from "@prisma/client";
import { createSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const location = searchParams.get("location");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (condition && Object.values(EquipmentCondition).includes(condition as EquipmentCondition)) {
      where.condition = condition as EquipmentCondition;
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    // Get equipment with seller info and certifications
    const equipment = await db.equipment.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
            role: true
          }
        },
        certifications: {
          where: {
            status: "APPROVED"
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await db.equipment.count({ where });

    return NextResponse.json({
      equipment,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to create equipment" },
        { status: 401 }
      );
    }

    requireRole(user, UserRole.FARMER);

    const body = await request.json();
    const { title, description, priceCents, currency, images, category, condition, location, certifications } = body;

    // Validate required fields
    if (!title || !priceCents || !category || !condition || !location) {
      return NextResponse.json(
        { error: "Validation Error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate certifications - at least one required
    if (!certifications || !Array.isArray(certifications) || certifications.length === 0) {
      return NextResponse.json(
        { error: "Validation Error", message: "At least one certification is required" },
        { status: 400 }
      );
    }

    // Validate condition enum
    if (!Object.values(EquipmentCondition).includes(condition)) {
      return NextResponse.json(
        { error: "Validation Error", message: "Invalid equipment condition" },
        { status: 400 }
      );
    }

    // Create unique slug
    let slug = createSlug(title);
    let counter = 1;
    while (await db.equipment.findUnique({ where: { slug } })) {
      slug = `${createSlug(title)}-${counter}`;
      counter++;
    }

    // Create equipment
    const equipment = await db.equipment.create({
      data: {
        title,
        slug,
        description,
        priceCents: parseInt(priceCents),
        currency: currency || "INR",
        images: images || [],
        category,
        condition,
        location,
        sellerId: user.id
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
            role: true
          }
        },
        certifications: true
      }
    });

    // Validate and create certifications
    const validStandards = Object.values(CertificationStandard);
    const validCertifications = [];

    for (const cert of certifications) {
      if (!cert.certificationNumber || !cert.standard || !cert.certifyingBody || !cert.issueDate || !cert.expiryDate) {
        return NextResponse.json(
          { error: "Validation Error", message: "All certification fields are required" },
          { status: 400 }
        );
      }

      if (!validStandards.includes(cert.standard)) {
        return NextResponse.json(
          { error: "Validation Error", message: "Invalid certification standard" },
          { status: 400 }
        );
      }

      // Validate dates
      const issueDate = new Date(cert.issueDate);
      const expiryDate = new Date(cert.expiryDate);

      if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
        return NextResponse.json(
          { error: "Validation Error", message: "Invalid certification dates" },
          { status: 400 }
        );
      }

      if (expiryDate <= issueDate) {
        return NextResponse.json(
          { error: "Validation Error", message: "Certification expiry date must be after issue date" },
          { status: 400 }
        );
      }

      validCertifications.push({
        certificationNumber: cert.certificationNumber.trim(),
        standard: cert.standard,
        certifyingBody: cert.certifyingBody.trim(),
        issueDate,
        expiryDate,
        documentUrl: cert.documentUrl?.trim() || null
      });
    }

    // Create certifications
    for (const certData of validCertifications) {
      await db.certification.create({
        data: {
          ...certData,
          equipmentId: equipment.id
        }
      });
    }

    // Refetch equipment with certifications
    const equipmentWithCerts = await db.equipment.findUnique({
      where: { id: equipment.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            whatsappNumber: true,
            role: true
          }
        },
        certifications: true
      }
    });

    return NextResponse.json(equipmentWithCerts, { status: 201 });

  } catch (error) {
    console.error("Error creating equipment:", error);

    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json(
        { error: "Forbidden", message: "Only farmers can create equipment listings" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create equipment" },
      { status: 500 }
    );
  }
}
