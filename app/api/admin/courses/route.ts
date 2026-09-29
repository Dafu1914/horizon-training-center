import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/mongodb";
import Course from "../../../../models/Course";
import User from "../../../../models/User";

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

    const courses = await Course.find()
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("=== ADMIN COURSES ERROR ===");
    console.error("Message:", error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}