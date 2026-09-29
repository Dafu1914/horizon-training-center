import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import Course from "../../../../models/Course";
import Chapter from "../../../../models/Chapter";
import Lesson from "../../../../models/Lesson";
import Enrollment from "../../../../models/Enrollment";
import LessonProgress from "../../../../models/LessonProgress";
import User from "../../../../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params;

    const course = await Course.findById(courseId).populate(
      "teacher",
      "name email"
    );
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isStaff =
      payload.role === "admin" ||
      (payload.role === "teacher" &&
        course.teacher._id.toString() === payload.userId);

    if (!isStaff) {
      const enrollment = await Enrollment.findOne({
        student: payload.userId,
        course: courseId,
        paymentStatus: { $in: ["paid", "free"] },
      });
      if (!enrollment) {
        return NextResponse.json(
          { error: "Not enrolled in this course" },
          { status: 403 }
        );
      }
    }

    const [chapters, lessons] = await Promise.all([
      Chapter.find({ course: courseId }).sort({ order: 1 }),
      Lesson.find({ course: courseId, isPublished: true }).sort({ order: 1 }),
    ]);

    const progressDocs = await LessonProgress.find({
      student: payload.userId,
      course: courseId,
    });

    const progressMap: Record<string, any> = {};
    progressDocs.forEach((p) => {
      progressMap[p.lesson.toString()] = {
        completed: p.completed,
        quizScore: p.quizScore,
        quizPassed: p.quizPassed,
        quizAttempts: p.quizAttempts,
      };
    });

    const lessonsWithProgress = lessons.map((l: any) => ({
      _id: l._id,
      chapter: l.chapter,
      title: l.title,
      order: l.order,
      videoUrl: l.videoUrl,
      videoType: l.videoType,
      textContent: l.textContent,
      attachments: l.attachments,
      hasQuiz: l.hasQuiz,
      questions: l.hasQuiz
        ? l.questions.map((q: any) => ({
            _id: q._id,
            type: q.type,
            question: q.question,
            options: q.options,
            points: q.points,
            // ⚠️ correctAnswer NOT sent to client — grading happens server-side
          }))
        : [],
      passingScore: l.passingScore,
      isFinalExam: l.isFinalExam,
      durationMinutes: l.durationMinutes,
      completed: progressMap[l._id.toString()]?.completed || false,
      quizPassed: progressMap[l._id.toString()]?.quizPassed || false,
      quizAttempts: progressMap[l._id.toString()]?.quizAttempts || 0,
    }));

    const totalLessons = lessonsWithProgress.length;
    const completedLessons = lessonsWithProgress.filter((l) => l.completed).length;
    const percentComplete =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        teacher: course.teacher,
      },
      chapters,
      lessons: lessonsWithProgress,
      progress: { totalLessons, completedLessons, percentComplete },
    });
  } catch (error: any) {
    console.error("=== LEARN GET ERROR ===");
    console.error(error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}