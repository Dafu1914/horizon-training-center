import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import Course from "../../../models/Course";
import { uploadFile } from "../../../lib/storage";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/x-zip-compressed",
];

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  try {
    await connectDB();

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
        { error: "Only teachers can upload files" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const courseId = formData.get("courseId") as string;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (
      course.teacher.toString() !== payload.userId &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploaded = [];

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.type} (${file.name})` },
          { status: 400 }
        );
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File too large (max 100MB): ${file.name}` },
          { status: 400 }
        );
      }

      const result = await uploadFile(file);

      const fileData = {
        name: file.name,
        url: result.url,
        type: result.type,
        size: result.size,
        publicId: result.publicId,
      };

      course.files.push(fileData);
      uploaded.push(fileData);
    }

    await course.save();

    return NextResponse.json({
      message: `${uploaded.length} file(s) uploaded`,
      files: uploaded,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

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

    const { courseId, fileId } = await req.json();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (
      course.teacher.toString() !== payload.userId &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    course.files = course.files.filter(
      (f: any) => f._id.toString() !== fileId
    );
    await course.save();

    return NextResponse.json({ message: "File deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}