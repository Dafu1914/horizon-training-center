import mongoose, { Schema, models } from "mongoose";

const LessonProgressSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },

    videoWatched: { type: Boolean, default: false },
    videoProgressSeconds: { type: Number, default: 0 },

    quizScore: { type: Number, default: 0 },
    quizMaxScore: { type: Number, default: 0 },
    quizPassed: { type: Boolean, default: false },
    quizAttempts: { type: Number, default: 0 },

    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export default models.LessonProgress ||
  mongoose.model("LessonProgress", LessonProgressSchema);