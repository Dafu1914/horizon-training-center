import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

// POST — student submits payment proof
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

    const { enrollmentId, method, transactionId, note } = await req.json();

    if (!enrollmentId || !method || !transactionId) {
      return NextResponse.json(
        { error: "Enrollment ID, method, and transaction ID required" },
        { status: 400 }
      );
    }

    if (!["telebirr", "cbe"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
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

    // Make sure it belongs to this student
    if (enrollment.student.toString() !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    enrollment.paymentStatus = "submitted";
    enrollment.paymentMethod = method;
    enrollment.transactionId = transactionId;
    enrollment.paymentNote = note || "";
    enrollment.submittedAt = new Date();
    await enrollment.save();

    return NextResponse.json({
      message: "Payment submitted! Wait for admin approval.",
      enrollment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}