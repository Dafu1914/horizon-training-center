import mongoose, { Schema, models } from "mongoose";

const LiveSessionSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },
    roomId: { type: String, required: true },
    recordingUrl: { type: String, default: "" },
    recordingReady: { type: Boolean, default: false },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default models.LiveSession ||
  mongoose.model("LiveSession", LiveSessionSchema);