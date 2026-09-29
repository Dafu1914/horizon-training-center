import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import Lesson from "../../../../models/Lesson";
import LessonProgress from "../../../../models/LessonProgress";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

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

    const { lessonId, answers } = await req.json();
    // answers = [ "4", "True", "container" ]

    if (!lessonId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "lessonId and answers array required" },
        { status: 400 }
      );
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!lesson.hasQuiz || lesson.questions.length === 0) {
      return NextResponse.json(
        { error: "This lesson has no quiz" },
        { status: 400 }
      );
    }

    // ===== AUTO-GRADE =====
    let earnedPoints = 0;
    let totalPoints = 0;
    const graded: any[] = [];

    lesson.questions.forEach((q: any, idx: number) => {
      const studentAnswer = (answers[idx] || "").toString().trim();
      const correctAnswer = q.correctAnswer.toString().trim();

      const isCorrect =
        studentAnswer.toLowerCase() === correctAnswer.toLowerCase();

      const pts = q.points || 1;
      totalPoints += pts;
      if (isCorrect) earnedPoints += pts;

      graded.push({
        question: q.question,
        type: q.type,
        studentAnswer,
        correctAnswer,
        isCorrect,
        points: pts,
      });
    });

    const scorePercent =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const passed = scorePercent >= (lesson.passingScore || 70);

    // ===== SAVE PROGRESS =====
    const progress = await LessonProgress.findOneAndUpdate(
      { student: payload.userId, lesson: lessonId },
      {
        student: payload.userId,
        course: lesson.course,
        lesson: lessonId,
        quizScore: scorePercent,
        quizMaxScore: 100,
        quizPassed: passed,
        $inc: { quizAttempts: 1 },
        // If passed, mark lesson complete
        ...(passed
          ? { completed: true, completedAt: new Date() }
          : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      score: scorePercent,
      passed,
      passingScore: lesson.passingScore || 70,
      earnedPoints,
      totalPoints,
      graded,
      progress,
    });
  } catch (error: any) {
    console.error("=== QUIZ SUBMIT ERROR ===");
    console.error(error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}