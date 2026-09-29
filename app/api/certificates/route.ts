import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

// GET — user's certificates (or all if admin)
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

    let query: any = {};
    if (payload.role === "admin") {
      // Admin sees all
    } else if (payload.role === "teacher") {
      query = {};
    } else {
      query = { student: payload.userId };
    }

    const certificates = await Certificate.find(query)
      .populate("student", "name email")
      .populate("course", "title category")
      .sort({ issuedAt: -1 });

    return NextResponse.json({ certificates });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}