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

    if (payload.role !== "admin" && payload.role !== "teacher") {
      return NextResponse.json(
        { error: "Only admins or teachers can approve enrollments" },
        { status: 403 }
      );
    }

    const { code, method } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Enrollment code required (e.g., HRZ-1234)" },
        { status: 400 }
      );
    }

    // Normalize code: uppercase, remove spaces
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "");

    const enrollment = await Enrollment.findOne({ code: cleanCode });

    if (!enrollment) {
      return NextResponse.json(
        { error: `No enrollment found with code "${cleanCode}"` },
        { status: 404 }
      );
    }

    if (enrollment.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This enrollment is already approved" },
        { status: 400 }
      );
    }

    // Mark as paid
    enrollment.paymentStatus = "paid";
    enrollment.paymentMethod = method || "manual";
    enrollment.approvedAt = new Date();
    await enrollment.save();

    // Add student to course
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

    // Generate certificate
    const existingCert = await Certificate.findOne({
      student: enrollment.student,
      course: enrollment.course,
    });

    let certificate;
    if (existingCert) {
      certificate = existingCert;
    } else {
      const student = await User.findById(enrollment.student);
      const teacher = course ? await User.findById(course.teacher) : null;

      certificate = await Certificate.create({
        student: enrollment.student,
        course: enrollment.course,
        certificateId: generateCertificateId(),
        studentName: student?.name || "Student",
        courseTitle: course?.title || "Course",
        teacherName: teacher?.name || "Horizon Instructor",
      });
    }

    return NextResponse.json({
      message: "Enrollment approved! Certificate issued.",
      certificate,
      student: certificate.studentName,
      course: certificate.courseTitle,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}