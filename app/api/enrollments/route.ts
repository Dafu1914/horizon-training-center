import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import Enrollment from "../../../models/Enrollment";
import Course from "../../../models/Course";
import { generateEnrollmentCode } from "../../../lib/enrollmentCode";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

// GET — student's enrollments
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

    const enrollments = await Enrollment.find({ student: payload.userId })
      .populate("course")
      .sort({ createdAt: -1 });

    return NextResponse.json({ enrollments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST — student enrolls in a course
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

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: payload.userId,
      course: courseId,
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Already enrolled",
          existingEnrollment: existing,
          code: existing.code,
        },
        { status: 400 }
      );
    }

    const isFree = course.price === 0;

    // Generate unique code — retry if collision
    let code = generateEnrollmentCode();
    let attempts = 0;
    while (await Enrollment.findOne({ code })) {
      code = generateEnrollmentCode();
      attempts++;
      if (attempts > 10) break;
    }

    const enrollment = await Enrollment.create({
      student: payload.userId,
      course: courseId,
      code,
      paymentStatus: isFree ? "free" : "pending",
    });

    return NextResponse.json(
      {
        message: isFree
          ? "Enrolled successfully!"
          : `Enrollment created. Your code: ${code}`,
        enrollment,
        code,
        requiresPayment: !isFree,
        price: course.price,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}