import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import LiveSession from "../../../../models/LiveSession";
import Course from "../../../../models/Course";
import Enrollment from "../../../../models/Enrollment";
import Message from "../../../../models/Message";
import Notification from "../../../../models/Notification";

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

    if (payload.role !== "teacher" && payload.role !== "admin") {
      return NextResponse.json(
        { error: "Only teachers can schedule live sessions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, title, description, scheduledAt, durationMinutes } = body;

    if (!courseId || !title || !scheduledAt) {
      return NextResponse.json(
        { error: "Course, title, and date are required" },
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
      return NextResponse.json(
        { error: "You can only schedule sessions for your own courses" },
        { status: 403 }
      );
    }

    const roomId = `horizon-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const session = await LiveSession.create({
      course: courseId,
      teacher: payload.userId,
      title,
      description: description || "",
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 60,
      status: "scheduled",
      roomId,
    });

    const enrollments = await Enrollment.find({
      course: courseId,
      paymentStatus: { $in: ["paid", "free"] },
    }).populate("student", "name email");

    const sessionLink = `/live/${session._id}`;
    const scheduledDate = new Date(scheduledAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    if (enrollments.length > 0) {
      const notifications = enrollments.map((e: any) => ({
        user: e.student._id,
        title: `🎥 New Live Class: ${title}`,
        body: `${course.title} — ${scheduledDate}`,
        link: sessionLink,
        icon: "🎥",
        read: false,
      }));

      await Notification.insertMany(notifications);

      const messages = enrollments.map((e: any) => ({
        from: payload.userId,
        fromName: payload.name || "Teacher",
        to: e.student._id,
        subject: `New Live Class: ${title}`,
        body: `A live class has been scheduled for "${course.title}".\n\n📅 ${scheduledDate}\n⏱️ ${durationMinutes || 60} minutes\n\nClick the button below to join when it starts.`,
        link: sessionLink,
        linkLabel: "Join Live Class",
        type: "live",
      }));

      await Message.insertMany(messages);
    }

    return NextResponse.json({
      message: `Live session scheduled! ${enrollments.length} student${
        enrollments.length === 1 ? "" : "s"
      } notified.`,
      session,
      notifiedCount: enrollments.length,
    });
  } catch (error: any) {
    console.error("=== LIVE CREATE ERROR ===");
    console.error("Message:", error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}