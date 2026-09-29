import mongoose, { Schema, models } from "mongoose";

const CertificateSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    certificateId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    teacherName: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);