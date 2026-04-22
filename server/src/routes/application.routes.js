import { Router } from "express";
import {
  applyForJob,
  getMyApplications,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import { auth, isAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/mine", auth, getMyApplications);
router.post("/:jobId", auth, upload.single("cv"), applyForJob);
router.patch("/:applicationId/status", auth, isAdmin, updateApplicationStatus);

export default router;
