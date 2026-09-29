import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import Lesson from "../../../../models/Lesson";
import LessonProgress from "../../../../models/LessonProgress";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

export async function GET(req: Request) {
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
    const courseId = searchParams.get("course");
    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    const [totalLessons, completedLessons] = await Promise.all([
      Lesson.countDocuments({ course: courseId, isPublished: true }),
      LessonProgress.countDocuments({
        student: payload.userId,
        course: courseId,
        completed: true,
      }),
    ]);

    const percent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return NextResponse.json({
      totalLessons,
      completedLessons,
      percentComplete: percent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}