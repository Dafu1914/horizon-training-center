import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import Enrollment from "../../../../models/Enrollment";
import Certificate from "../../../../models/Certificate";

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

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [users, courses, enrollments, certificates, pending] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Enrollment.countDocuments({ paymentStatus: "paid" }),
        Certificate.countDocuments(),
        Enrollment.countDocuments({ paymentStatus: "submitted" }),
      ]);

    // Calculate revenue (sum of paid enrollments' course prices)
    const paidEnrollments = await Enrollment.find({
      paymentStatus: "paid",
    }).populate("course", "price");

    const revenue = paidEnrollments.reduce((sum, e: any) => {
      return sum + (e.course?.price || 0);
    }, 0);

    return NextResponse.json({
      users,
      courses,
      enrollments,
      certificates,
      pending,
      revenue,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}