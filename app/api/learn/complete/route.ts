import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import LessonProgress from "../../../../models/LessonProgress";
import Lesson from "../../../../models/Lesson";
import Course from "../../../../models/Course";
import Enrollment from "../../../../models/Enrollment";
import Certificate from "../../../../models/Certificate";
import Message from "../../../../models/Message";
import Notification from "../../../../models/Notification";
import User from "../../../../models/User";
import { generateCertificateId } from "../../../../lib/certificate";

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

    const { lessonId } = await req.json();
    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Mark lesson complete
    const progress = await LessonProgress.findOneAndUpdate(
      { student: payload.userId, lesson: lessonId },
      {
        student: payload.userId,
        course: lesson.course,
        lesson: lessonId,
        completed: true,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // ===== CHECK IF COURSE COMPLETE =====
    const [allLessons, completedProgress] = await Promise.all([
      Lesson.countDocuments({
        course: lesson.course,
        isPublished: true,
      }),
      LessonProgress.countDocuments({
        student: payload.userId,
        course: lesson.course,
        completed: true,
      }),
    ]);

    const courseComplete = completedProgress >= allLessons && allLessons > 0;

    let certificateIssued = false;
    let certificate = null;

    if (courseComplete) {
      // Check if cert already exists
      const existing = await Certificate.findOne({
        student: payload.userId,
        course: lesson.course,
      });

      if (!existing) {
        // Generate certificate
        const course = await Course.findById(lesson.course);
        const student = await User.findById(payload.userId);
        const teacher = course
          ? await User.findById(course.teacher)
          : null;

        certificate = await Certificate.create({
          student: payload.userId,
          course: lesson.course,
          certificateId: generateCertificateId(),
          studentName: student?.name || "Student",
          courseTitle: course?.title || "Course",
          teacherName: teacher?.name || "Horizon Instructor",
        });

        certificateIssued = true;

        // 🎉 Notify student
        await Notification.create({
          user: payload.userId,
          title: `🏆 Certificate Earned!`,
          body: `You've completed "${course?.title}". Download your certificate now!`,
          link: `/certificates/${certificate._id}`,
          icon: "🏆",
          read: false,
        });

        // 📬 Inbox message
        await Message.create({
          from: null,
          fromName: "Horizon",
          to: payload.userId,
          subject: `🏆 Congratulations! You've completed "${course?.title}"`,
          body: `Amazing work! You've completed every lesson in this course.\n\nYour certificate is ready — click below to view and download it.`,
          link: `/certificates/${certificate._id}`,
          linkLabel: "View Certificate",
          type: "system",
        });

        // Update enrollment progress
        await Enrollment.findOneAndUpdate(
          { student: payload.userId, course: lesson.course },
          { progress: 100, completed: true }
        );
      } else {
        certificate = existing;
      }
    }

    return NextResponse.json({
      message: courseComplete
        ? certificateIssued
          ? "🎉 Course complete! Certificate issued!"
          : "Lesson marked complete (course already finished)"
        : "Lesson marked complete",
      progress,
      courseComplete,
      certificateIssued,
      certificate,
      stats: {
        totalLessons: allLessons,
        completedLessons: completedProgress,
      },
    });
  } catch (error: any) {
    console.error("=== COMPLETE ERROR ===");
    console.error(error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}