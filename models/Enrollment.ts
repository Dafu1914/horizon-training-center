import mongoose, { Schema, models } from "mongoose";

const EnrollmentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    code: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "paid", "failed", "free"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["", "telebirr", "cbe", "free", "manual"],
      default: "",
    },
    transactionId: { type: String, default: "" },
    paymentNote: { type: String, default: "" },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default models.Enrollment ||
  mongoose.model("Enrollment", EnrollmentSchema);