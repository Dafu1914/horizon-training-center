import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import Chapter from "../../../models/Chapter";
import Course from "../../../models/Course";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

// GET — chapters for a course
// ?course={id}
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("course");
    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    const chapters = await Chapter.find({ course: courseId }).sort({ order: 1 });
    return NextResponse.json({ chapters });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST — create chapter
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId, title, description } = await req.json();
    if (!courseId || !title) {
      return NextResponse.json(
        { error: "Course ID and title required" },
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

    // Get next order number
    const lastChapter = await Chapter.findOne({ course: courseId }).sort({
      order: -1,
    });
    const order = lastChapter ? lastChapter.order + 1 : 1;

    const chapter = await Chapter.create({
      course: courseId,
      title,
      description: description || "",
      order,
    });

    return NextResponse.json({ message: "Chapter created", chapter });
  } catch (error: any) {
    console.error("=== CHAPTER POST ERROR ===");
    console.error(error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH — update chapter (title, description, order)
export async function PATCH(req: Request) {
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

    const { chapterId, title, description } = await req.json();
    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID required" }, { status: 400 });
    }

    const chapter = await Chapter.findById(chapterId).populate("course");
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const course: any = chapter.course;
    if (
      course.teacher.toString() !== payload.userId &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (title !== undefined) chapter.title = title;
    if (description !== undefined) chapter.description = description;
    await chapter.save();

    return NextResponse.json({ message: "Chapter updated", chapter });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE — remove chapter + its lessons
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

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("id");
    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID required" }, { status: 400 });
    }

    const chapter = await Chapter.findById(chapterId).populate("course");
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const course: any = chapter.course;
    if (
      course.teacher.toString() !== payload.userId &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete lessons in this chapter
    const Lesson = (await import("../../../models/Lesson")).default;
    await Lesson.deleteMany({ chapter: chapterId });

    await Chapter.findByIdAndDelete(chapterId);

    return NextResponse.json({ message: "Chapter deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}