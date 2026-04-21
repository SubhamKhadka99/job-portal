import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["applied", "reviewing", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
    cvUrl: { type: String, required: true },
    cvPublicId: { type: String, required: true },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, user: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
