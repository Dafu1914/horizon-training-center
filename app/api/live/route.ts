import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import LiveSession from "../../../models/LiveSession";
import Enrollment from "../../../models/Enrollment";

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
    const upcoming = searchParams.get("upcoming");

    const query: any = {};

    if (courseId) {
      query.course = courseId;
    }

    if (upcoming === "true") {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      query.scheduledAt = { $gte: now };
      query.status = { $ne: "cancelled" };
    }

    if (payload.role === "student") {
      const enrollments = await Enrollment.find({
        student: payload.userId,
        paymentStatus: { $in: ["paid", "free"] },
      }).select("course");

      const courseIds = enrollments.map((e: any) => e.course);

      if (courseId) {
        if (!courseIds.some((id) => id.toString() === courseId)) {
          return NextResponse.json({ sessions: [] });
        }
      } else {
        query.course = { $in: courseIds };
      }
    }

    const sessions = await LiveSession.find(query)
      .populate("course", "title category price")
      .populate("teacher", "name email")
      .sort({ scheduledAt: 1 });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("=== LIVE GET ERROR ===");
    console.error("Message:", error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}