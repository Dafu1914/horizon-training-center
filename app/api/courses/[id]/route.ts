import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Course from "../../../../models/Course";
import User from "../../../../models/User"; // 👈 REGISTER User

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const course = await Course.findById(id).populate(
      "teacher",
      "name email"
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    console.error("=== COURSE BY ID ERROR ===");
    console.error("Message:", error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}