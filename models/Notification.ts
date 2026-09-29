import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    link: { type: String, default: "" },
    icon: { type: String, default: "🔔" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Notification ||
  mongoose.model("Notification", NotificationSchema);