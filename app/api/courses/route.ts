import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import Course from "../../../models/Course";
import User from "../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const teacherFilter = searchParams.get("teacher");

    const query: any = { status: "published" };
    if (teacherFilter) {
      query.teacher = teacherFilter;
    }

    const courses = await Course.find(query)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("=== COURSES GET ERROR ===");
    console.error("Message:", error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

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
        { error: "Only teachers can create courses" },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description required" },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title: body.title,
      description: body.description,
      price: body.price || 0,
      category: body.category || "General",
      level: body.level || "Beginner",
      thumbnail: body.thumbnail || "",
      files: [],
      teacher: payload.userId,
      status: "published",
    });

    return NextResponse.json(
      { message: "Course created", course },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("=== COURSES POST ERROR ===");
    console.error("Message:", error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
