import mongoose, { Schema, models } from "mongoose";

const FileSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }, // mime type
    size: { type: Number, default: 0 }, // bytes
    publicId: { type: String, default: "" }, // cloudinary public id (if cloud)
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    price: { type: Number, default: 0 },
    category: { type: String, default: "General" },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    files: [FileSchema],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default models.Course || mongoose.model("Course", CourseSchema);