import mongoose, { Schema, models } from "mongoose";

// ============ QUESTION SUB-SCHEMA ============
const QuestionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["multiple", "boolean", "short"],
      required: true,
    },
    question: { type: String, required: true },
    options: [{ type: String }], // used for multiple choice
    correctAnswer: { type: String, required: true },
    points: { type: Number, default: 1 },
  },
  { _id: true }
);

// ============ LESSON SCHEMA ============
const LessonSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },

    // ===== Video =====
    videoUrl: { type: String, default: "" },
    videoType: {
      type: String,
      enum: ["youtube", "vimeo", "upload", "none"],
      default: "none",
    },

    // ===== Text =====
    textContent: { type: String, default: "" },

    // ===== Attachments =====
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],

    // ===== Quiz =====
    hasQuiz: { type: Boolean, default: false },
    questions: [QuestionSchema],
    passingScore: { type: Number, default: 70 }, // percent
    isFinalExam: { type: Boolean, default: false },
    timeLimitMinutes: { type: Number, default: 0 }, // 0 = no limit

    // ===== Meta =====
    durationMinutes: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LessonSchema.index({ chapter: 1, order: 1 });

export default models.Lesson || mongoose.model("Lesson", LessonSchema);