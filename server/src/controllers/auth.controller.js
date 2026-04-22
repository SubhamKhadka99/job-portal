import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.model.js";
import { signToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: generate a 6-digit numeric code ───────────────────────────────────
function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

// ── Signup ────────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    // If account exists but is unverified, resend a fresh code
    if (existing && !existing.isVerified) {
      const code   = generateCode();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      existing.verificationCode   = code;
      existing.verificationExpiry = expiry;
      await existing.save();
      await sendVerificationEmail(existing.email, existing.name, code);
      return res.status(200).json({
        success:              true,
        requiresVerification: true,
        email:                existing.email,
        message:              "A new verification code has been sent to your email.",
      });
    }

    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code           = generateCode();
    const expiry         = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name,
      email:              email.toLowerCase(),
      password:           hashedPassword,
      role:               role === "admin" ? "admin" : "user",
      authProvider:       "local",
      isVerified:         false,
      verificationCode:   code,
      verificationExpiry: expiry,
    });

    try {
      await sendVerificationEmail(user.email, user.name, code);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr.message);
    }

    return res.status(201).json({
      success:              true,
      requiresVerification: true,
      email:                user.email,
      message:              "Account created. Check your email for a 6-digit verification code.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Verify email ──────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    if (user.isVerified) {
      const token = signToken(user._id);
      return res.json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (new Date() > user.verificationExpiry) {
      return res.status(400).json({ success: false, message: "Verification code has expired. Request a new one." });
    }

    user.isVerified         = true;
    user.verificationCode   = null;
    user.verificationExpiry = null;
    await user.save();

    const token = signToken(user._id);
    return res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Resend code ───────────────────────────────────────────────────────────────
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    const code   = generateCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode   = code;
    user.verificationExpiry = expiry;
    await user.save();

    await sendVerificationEmail(user.email, user.name, code);

    return res.json({ success: true, message: "A new verification code has been sent." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      const code   = generateCode();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      user.verificationCode   = code;
      user.verificationExpiry = expiry;
      await user.save();
      try {
        await sendVerificationEmail(user.email, user.name, code);
      } catch (mailErr) {
        console.error("Failed to resend code on login:", mailErr.message);
      }
      return res.status(403).json({
        success:              false,
        requiresVerification: true,
        email:                user.email,
        message:              "Please verify your email. A new code has been sent.",
      });
    }

    const token = signToken(user._id);
    return res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Google login ──────────────────────────────────────────────────────────────
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Google token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ success: false, message: "Invalid Google token payload" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name:         payload.name || payload.email.split("@")[0],
        email:        payload.email.toLowerCase(),
        googleId:     payload.sub,
        avatarUrl:    payload.picture || "",
        authProvider: "google",
        isVerified:   true,
      });
    } else if (!user.googleId) {
      user.googleId     = payload.sub;
      user.authProvider = "google";
      user.avatarUrl    = payload.picture || user.avatarUrl;
      user.isVerified   = true;
      await user.save();
    }

    const token = signToken(user._id);
    return res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Google login failed" });
  }
};
