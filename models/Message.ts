import mongoose, { Schema, models } from "mongoose";

const MessageSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: false }, // null = system
    fromName: { type: String, default: "Horizon" },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String, default: "" }, // optional CTA link
    linkLabel: { type: String, default: "" },
    read: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["system", "teacher", "student", "live", "payment"],
      default: "system",
    },
  },
  { timestamps: true }
);

export default models.Message || mongoose.model("Message", MessageSchema);