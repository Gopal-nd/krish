import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to upgrade your role" },
        { status: 401 }
      );
    }

    // Check if user is already a farmer
    if (user.role === UserRole.FARMER) {
      return NextResponse.json(
        { error: "Already Farmer", message: "You are already a farmer" },
        { status: 400 }
      );
    }

    // Update user role to FARMER
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { role: UserRole.FARMER },
      select: { id: true, email: true, name: true, role: true }
    });

    return NextResponse.json({
      message: "Successfully upgraded to farmer role",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error upgrading user role:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to upgrade role" },
      { status: 500 }
    );
  }
}
