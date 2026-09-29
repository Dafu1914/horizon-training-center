import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    banned: { type: Boolean, default: false },
    bannedReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);