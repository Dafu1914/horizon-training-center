import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Course from "../../../../models/Course";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const price = searchParams.get("price") || "";

    const query: any = { status: "published" };

    if (q.trim()) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (price === "Free") {
      query.price = 0;
    } else if (price === "Paid") {
      query.price = { $gt: 0 };
    }

    const courses = await Course.find(query)
      .select("title description price category thumbnail")
      .limit(8)
      .sort({ createdAt: -1 });

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("=== SEARCH ERROR ===");
    console.error(error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}