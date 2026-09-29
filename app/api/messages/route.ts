import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/mongodb";
import Message from "../../../models/Message";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

// GET — user's messages
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

    const messages = await Message.find({ to: payload.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Message.countDocuments({
      to: payload.userId,
      read: false,
    });

    return NextResponse.json({ messages, unreadCount });
  } catch (error: any) {
    console.error("=== MESSAGES ERROR ===");
    console.error(error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH — mark all messages as read
export async function PATCH(req: Request) {
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

    await Message.updateMany(
      { to: payload.userId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ message: "All marked as read" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}