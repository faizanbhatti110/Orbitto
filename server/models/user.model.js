import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  img: { type: String },
  country: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["student", "faculty"], default: "student" }, // ← ADD THIS
  isSeller: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  desc: { type: String },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
