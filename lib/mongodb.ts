import mongoose from "mongoose";

// ⚠️ Import ALL models so they're registered before populate() calls
import "./../models/User";
import "./../models/Course";
import "./../models/Enrollment";
import "./../models/LiveSession";
import "./../models/Message";
import "./../models/Notification";
import "./../models/Certificate";
import "./../models/Chapter";
import "./../models/Lesson";
import "./../models/LessonProgress";
import "./../models/CourseProgress";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;