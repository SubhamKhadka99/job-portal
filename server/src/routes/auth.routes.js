import { Router } from "express";
import { googleLogin, login, signup, verifyEmail, resendCode } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup",  signup);
router.post("/login",   login);
router.post("/google",  googleLogin);
router.post("/verify",  verifyEmail);
router.post("/resend",  resendCode);

export default router;
