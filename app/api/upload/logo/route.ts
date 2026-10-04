import { NextRequest, NextResponse } from "next/server";
import { requireFamilyAdmin } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await requireFamilyAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No logo file provided" }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Logo file exceeds maximum size limit of 5MB" },
        { status: 400 }
      );
    }

    // Validate mime type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/svg+xml",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: PNG, JPG, WEBP, SVG." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save under public/uploads/logos/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });

    let ext = path.extname(file.name);
    if (!ext) {
      if (file.type === "image/svg+xml") ext = ".svg";
      else if (file.type === "image/png") ext = ".png";
      else if (file.type === "image/webp") ext = ".webp";
      else ext = ".jpg";
    }

    const uniqueName = `logo-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/logos/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("Logo upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}
