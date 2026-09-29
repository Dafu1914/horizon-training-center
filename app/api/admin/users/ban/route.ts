import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../../lib/mongodb";
import User from "../../../../../models/User";

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
        { error: "Only admins can ban users" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, banned, reason } = body;

    console.log("=== BAN REQUEST ===");
    console.log("userId:", userId);
    console.log("banned:", banned);
    console.log("reason:", reason);

    if (!userId || typeof banned !== "boolean") {
      return NextResponse.json(
        { error: "userId and banned (true/false) required" },
        { status: 400 }
      );
    }

    if (userId === payload.userId) {
      return NextResponse.json(
        { error: "You cannot ban yourself" },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "You cannot ban another admin" },
        { status: 400 }
      );
    }

    console.log("Before:", {
      banned: targetUser.banned,
      reason: targetUser.bannedReason,
    });

    targetUser.banned = banned;
    targetUser.bannedReason = banned ? reason || "Violated terms" : "";

    console.log("After (before save):", {
      banned: targetUser.banned,
      reason: targetUser.bannedReason,
    });

    await targetUser.save();

    console.log("Saved successfully!");

    return NextResponse.json({
      message: banned ? "User banned" : "User unbanned",
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        banned: targetUser.banned,
      },
    });
  } catch (error: any) {
    console.error("=== BAN ERROR ===");
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}