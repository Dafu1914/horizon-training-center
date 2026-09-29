import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "horizon-secret-change-me";

export async function POST(req: Request) {
  try {
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

    const { roomName } = await req.json();
    if (!roomName) {
      return NextResponse.json(
        { error: "Room name required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: payload.userId,
      name: payload.name || "User",
      ttl: "2h",
    });

    // Teacher/admin = can publish; student = can only subscribe + publish mic for questions
    const isTeacher = payload.role === "teacher" || payload.role === "admin";

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: isTeacher,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwtToken = await at.toJwt();

    return NextResponse.json({
      token: jwtToken,
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
      role: payload.role,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}