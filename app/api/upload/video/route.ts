import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

export const runtime = "nodejs";
// Allow larger bodies for video uploads
export const maxDuration = 60;

const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/ogg",
];

const PROVIDER = process.env.STORAGE_PROVIDER || "local";

export async function POST(req: Request) {
  try {
    // Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (payload.role !== "teacher" && payload.role !== "admin") {
      return NextResponse.json(
        { error: "Only teachers can upload videos" },
        { status: 403 }
      );
    }

    // Parse form
    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Video type not allowed: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (max 500 MB)` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ===== CLOUDINARY (if configured) =====
    if (PROVIDER === "cloudinary" && process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "video",
              folder: "horizon/videos",
              use_filename: true,
              unique_filename: true,
              chunk_size: 6000000,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      return NextResponse.json({
        message: "Video uploaded to Cloudinary",
        url: result.secure_url,
        provider: "cloudinary",
        type: "video",
        size: file.size,
        duration: result.duration || 0,
      });
    }

    // ===== LOCAL DISK (default) =====
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const uniqueName = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      message: "Video uploaded locally",
      url: `/uploads/videos/${uniqueName}`,
      provider: "local",
      type: "video",
      size: file.size,
    });
  } catch (error: any) {
    console.error("=== VIDEO UPLOAD ERROR ===");
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}