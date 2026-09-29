import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import Lesson from "../../../models/Lesson";
import Chapter from "../../../models/Chapter";
import Course from "../../../models/Course";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

// GET — lessons for a chapter
// ?chapter={id}
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapter");
    const courseId = searchParams.get("course");

    if (!chapterId && !courseId) {
      return NextResponse.json(
        { error: "Chapter or course ID required" },
        { status: 400 }
      );
    }

    const query: any = {};
    if (chapterId) query.chapter = chapterId;
    if (courseId) query.course = courseId;

    const lessons = await Lesson.find(query).sort({ order: 1 });
    return NextResponse.json({ lessons });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST — create lesson
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

    const body = await req.json();
    const { chapterId, ...lessonData } = body;

    if (!chapterId || !lessonData.title) {
      return NextResponse.json(
        { error: "Chapter ID and lesson title required" },
        { status: 400 }
      );
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const course = await Course.findById(chapter.course);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (
      course.teacher.toString() !== payload.userId &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Next order
    const lastLesson = await Lesson.findOne({ chapter: chapterId }).sort({
      order: -1,
    });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await Lesson.create({
      course: chapter.course,
      chapter: chapterId,
      title: lessonData.title,
      order,
      videoUrl: lessonData.videoUrl || "",
      videoType: lessonData.videoType || "none",
      textContent: lessonData.textContent || "",
      attachments: lessonData.attachments || [],
      hasQuiz: lessonData.hasQuiz || false,
      questions: lessonData.questions || [],
      passingScore: lessonData.passingScore || 70,
      isFinalExam: lessonData.isFinalExam || false,
      timeLimitMinutes: lessonData.timeLimitMinutes || 0,
      durationMinutes: lessonData.durationMinutes || 0,
      isPublished: lessonData.isPublished !== false,
    });

    return NextResponse.json({ message: "Lesson created", lesson });
  } catch (error: any) {
    console.error("=== LESSON POST ERROR ===");
    console.error(error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH — update lesson
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

    const body = await req.json();
    const { lessonId, ...updates } = body;
    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const course = await Course.findById(lesson.course);
    if (
      !course ||
      (course.teacher.toString() !== payload.userId &&
        payload.role !== "admin")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Apply updates
    const allowed = [
      "title",
      "videoUrl",
      "videoType",
      "textContent",
      "attachments",
      "hasQuiz",
      "questions",
      "passingScore",
      "isFinalExam",
      "timeLimitMinutes",
      "durationMinutes",
      "isPublished",
      "order",
    ];
    allowed.forEach((key) => {
      if (updates[key] !== undefined) (lesson as any)[key] = updates[key];
    });

    await lesson.save();

    return NextResponse.json({ message: "Lesson updated", lesson });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE — remove lesson + its progress
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
    const lessonId = searchParams.get("id");
    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const course = await Course.findById(lesson.course);
    if (
      !course ||
      (course.teacher.toString() !== payload.userId &&
        payload.role !== "admin")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const LessonProgress = (await import("../../../models/LessonProgress"))
      .default;
    await LessonProgress.deleteMany({ lesson: lessonId });

    await Lesson.findByIdAndDelete(lessonId);

    return NextResponse.json({ message: "Lesson deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}