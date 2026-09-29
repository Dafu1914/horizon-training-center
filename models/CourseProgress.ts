import mongoose, { Schema, models } from "mongoose";

const CourseProgressSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    // Aggregated counters (updated when lesson progress changes)
    totalLessons: { type: Number, default: 0 },
    completedLessons: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },

    // Final exam
    finalExamPassed: { type: Boolean, default: false },
    finalExamScore: { type: Number, default: 0 },

    // Certificate
    certificateIssued: { type: Boolean, default: false },

    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CourseProgressSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

export default models.CourseProgress ||
  mongoose.model("CourseProgress", CourseProgressSchema);