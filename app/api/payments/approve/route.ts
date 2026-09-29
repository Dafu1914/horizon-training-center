import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import Certificate from "@/models/Certificate";
import User from "@/models/User";
import { generateCertificateId } from "@/lib/certificate";

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

    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can approve payments" },
        { status: 403 }
      );
    }

    const { enrollmentId, action } = await req.json();

    if (!enrollmentId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "enrollmentId and action (approve/reject) required" },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      enrollment.paymentStatus = "paid";
      enrollment.approvedAt = new Date();
      await enrollment.save();

      // Add student to course's students array
      const course = await Course.findById(enrollment.course);
      if (course) {
        const already = course.students.some(
          (s: any) => s.toString() === enrollment.student.toString()
        );
        if (!already) {
          course.students.push(enrollment.student);
          await course.save();
        }
      }

      // 🎓 Generate certificate (skip if already exists)
      const existingCert = await Certificate.findOne({
        student: enrollment.student,
        course: enrollment.course,
      });

      if (!existingCert) {
        const student = await User.findById(enrollment.student);
        const teacher = course ? await User.findById(course.teacher) : null;

        await Certificate.create({
          student: enrollment.student,
          course: enrollment.course,
          certificateId: generateCertificateId(),
          studentName: student?.name || "Student",
          courseTitle: course?.title || "Course",
          teacherName: teacher?.name || "Horizon Instructor",
        });
      }
    } else {
      enrollment.paymentStatus = "failed";
      await enrollment.save();
    }

    return NextResponse.json({
      message: `Payment ${action}d`,
      enrollment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}