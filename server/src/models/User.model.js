import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: { type: String, default: null },
  role: { type: String, enum: ["user", "admin"], default: "user", index: true },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  googleId: { type: String, unique: true, sparse: true, default: null },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  skills: [{ type: String }],
  experience: { type: String, default: "" },
  bio: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  resumePublicId: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;