import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.model.js";
import { signToken } from "../utils/jwt.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      authProvider: "local",
    });

    const token = signToken(user._id);
    return res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        avatarUrl: payload.picture || "",
        authProvider: "google",
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.authProvider = "google";
      user.avatarUrl = payload.picture || user.avatarUrl;
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
