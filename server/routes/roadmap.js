// routes/roadmap.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { protect } from "../middlewares/authMiddleware.js";

dotenv.config();

const router = express.Router();

const FASTAPI_URL = process.env.FASTAPI_URL || "https://ai-recommedation-microservice.onrender.com/api/roadmap";
const FASTAPI_API_KEY = process.env.FASTAPI_API_KEY || "";

router.post("/send", protect, async (req, res) => {
  try {
    const user = req.user; // set by protect middleware (Mongoose user doc without password)
    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { targetRole } = req.body;
    if (!targetRole) {
      return res.status(400).json({ success: false, message: "targetRole is required" });
    }

    const payload = {
      user_id: String(user._id),
      target_role: targetRole,
      model: "gemini-flash-latest"
    };

    const headers = { "Content-Type": "application/json" };
    if (FASTAPI_API_KEY) headers["x-api-key"] = FASTAPI_API_KEY;

    console.log("Calling FastAPI:", FASTAPI_URL, "payload:", payload);

    const response = await axios.post(FASTAPI_URL, payload, { headers, timeout: 120000 });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Roadmap send error:", err?.response?.data || err.message);

    if (err.response && err.response.data) {
      const status = err.response.status || 500;
      return res.status(status).json(err.response.data);
    }

    return res.status(500).json({ success: false, message: "Failed to generate roadmap" });
  }
});

export default router;
