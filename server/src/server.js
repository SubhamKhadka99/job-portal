import "./config/instrument.js";
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import userRoutes from "./routes/user.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

//! Initialize Express

const app = express();

//! Connect to database

await connectDB();

//! Middlewares

app.use(cors());
// Note: webhook routes must be mounted BEFORE express.json() so they receive the raw body
app.use("/api/webhooks", webhookRoutes);
app.use(express.json());

//! Routes
app.get("/", (req, res) => res.send("API Working"));
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);

app.use((error, req, res, next) => {
  if (error.message?.includes("Only PDF CV files are allowed")) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "CV file exceeds 5MB size limit" });
  }
  return next(error);
});

//! Port
const PORT = process.env.PORT || 5000;
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
