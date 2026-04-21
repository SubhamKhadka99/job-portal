import { Readable } from "stream";
import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";

const uploadCvToCloudinary = (fileBuffer, filename) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "job-board/cvs", public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(stream);
  });

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { fullName, email, phone, coverLetter } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "CV file is required" });
    }

    const job = await Job.findOne({ _id: jobId, status: "open" });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found or closed" });
    }

    const existingApplication = await Application.findOne({ user: req.user._id, job: jobId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: "You have already applied to this job" });
    }

    const cvUpload = await uploadCvToCloudinary(req.file.buffer, `cv_${req.user._id}_${Date.now()}`);

    const application = await Application.create({
      job: jobId,
      user: req.user._id,
      fullName: fullName || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone,
      coverLetter: coverLetter || "",
      cvUrl: cvUpload.secure_url,
      cvPublicId: cvUpload.public_id,
    });

    await User.findByIdAndUpdate(req.user._id, {
      resumeUrl: cvUpload.secure_url,
      resumePublicId: cvUpload.public_id,
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate("job", "title company location type status")
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, adminNote } = req.body;

    const validStatuses = ["applied", "reviewing", "shortlisted", "rejected", "hired"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // Verify the application belongs to a job posted by this admin
    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (adminNote !== undefined) updates.adminNote = adminNote;

    const updated = await Application.findByIdAndUpdate(applicationId, updates, {
      new: true,
      runValidators: true,
    }).populate("job", "title company");

    return res.json({ success: true, application: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
