import { Router } from "express";
import {
  createJob,
  getAdminJobs,
  getJobApplications,
  getJobs,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { auth, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getJobs);
router.post("/", auth, isAdmin, createJob);
router.get("/admin/mine", auth, isAdmin, getAdminJobs);
router.get("/admin/:jobId/applications", auth, isAdmin, getJobApplications);
router.put("/:jobId", auth, isAdmin, updateJob);
router.delete("/:jobId", auth, isAdmin, deleteJob);

export default router;
