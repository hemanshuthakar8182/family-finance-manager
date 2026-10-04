import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address").optional(),
});

export async function GET() {
  try {
    const authUser = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        memberships: {
          where: { familyId: authUser.familyId, status: "ACTIVE" },
          include: { family: true },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = dbUser.memberships[0];

    return NextResponse.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatarUrl: dbUser.avatarUrl,
      role: membership?.role || authUser.role,
      familyId: membership?.familyId || authUser.familyId,
      familyName: membership?.family.name || authUser.familyName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await requireAuth();
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    // If email is changing, ensure it's not taken by another user
    if (validated.email && validated.email.toLowerCase() !== authUser.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email: validated.email.toLowerCase() },
      });
      if (existing && existing.id !== authUser.id) {
        return NextResponse.json(
          { error: "This email address is already in use by another account" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name: validated.name.trim(),
        ...(validated.email ? { email: validated.email.toLowerCase().trim() } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
