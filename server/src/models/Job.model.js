import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract", "remote"],
      default: "full-time",
    },
    description: { type: String, required: true, trim: true },
    requirements: [{ type: String }],
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      default: "junior",
    },
    applicationDeadline: { type: Date, default: null },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ title: "text", company: "text", description: "text" });

const Job = mongoose.model("Job", jobSchema);

export default Job;
