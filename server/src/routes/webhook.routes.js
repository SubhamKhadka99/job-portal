import { Router } from "express";
import express from "express";
import clerkWebhooks from "../controllers/webhook.controller.js";

const router = Router();

// Clerk webhook — needs raw body for Svix signature verification
router.post("/clerk", express.raw({ type: "application/json" }), (req, res, next) => {
  // If body is a Buffer (raw), parse it as JSON for the controller
  if (Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString());
  }
  next();
}, clerkWebhooks);

export default router;
