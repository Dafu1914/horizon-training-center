import mongoose, { Schema, models } from "mongoose";

const ChapterSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 }, // 1, 2, 3...
  },
  { timestamps: true }
);

ChapterSchema.index({ course: 1, order: 1 });

export default models.Chapter || mongoose.model("Chapter", ChapterSchema);