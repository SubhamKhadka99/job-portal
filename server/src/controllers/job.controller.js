import Job from "../models/Job.model.js";
import Application from "../models/Application.model.js";

export const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    return res.status(201).json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { status: "open" };

    if (q) {
      filter.$text = { $search: q };
    }

    const jobs = await Job.find(filter).populate("postedBy", "name email").sort({ createdAt: -1 });
    return res.json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const applications = await Application.find({ job: jobId })
      .populate("user", "name email phone location resumeUrl")
      .sort({ createdAt: -1 });

    return res.json({ success: true, job, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Only the admin who posted the job can update it
    const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Prevent changing postedBy via update
    const { postedBy, ...allowedUpdates } = req.body;

    const updated = await Job.findByIdAndUpdate(jobId, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, job: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Only the admin who posted the job can delete it
    const job = await Job.findOne({ _id: jobId, postedBy: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await Job.findByIdAndDelete(jobId);

    return res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

