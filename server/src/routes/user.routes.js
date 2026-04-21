import { Router } from "express";
import { getMe, updateProfile } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", auth, getMe);
router.put("/profile", auth, updateProfile);

export default router;
