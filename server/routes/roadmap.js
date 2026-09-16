// routes/roadmap.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { protect } from "../middlewares/authMiddleware.js";

dotenv.config();

const router = express.Router();

const FASTAPI_URL = (process.env.FASTAPI_URL || "https://ai-recommedation-microservice.onrender.com/api/roadmap")
  .trim()
  .replace(/^['"]|['"]$/g, "");
const FASTAPI_API_KEY = (process.env.FASTAPI_API_KEY || "")
  .trim()
  .replace(/^['"]|['"]$/g, "");

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

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
      model: "gemini-3.1-flash-lite"
    };

    const headers = { "Content-Type": "application/json" };
    if (FASTAPI_API_KEY) headers["x-api-key"] = FASTAPI_API_KEY;

    console.log("Calling FastAPI:", FASTAPI_URL, "payload:", payload);

    let response;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await axios.post(FASTAPI_URL, payload, {
          headers,
          timeout: 90000
        });
        break;
      } catch (error) {
        const retryable = error.response?.status === 429;
        if (!retryable || attempt === 1) throw error;

        const retryAfter = Number(error.response.headers?.['retry-after']);
        const delay = Number.isFinite(retryAfter)
          ? Math.min(Math.max(retryAfter * 1000, 1000), 5000)
          : 2000;
        await wait(delay);
      }
    }

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Roadmap send error:", {
      message: err.message,
      status: err.response?.status,
      response: err.response?.data
    });

    if (err.response && err.response.data) {
      const status = err.response.status || 500;
      const responseData = err.response.data;
      const upstreamMessage = typeof responseData === "string"
        ? responseData.trim()
        : responseData.message || responseData.detail;
      const message = status === 429
        ? "The AI service is temporarily rate-limited. Please try again later."
        : upstreamMessage || "AI roadmap service failed";

      return res.status(status).json({
        success: false,
        message,
        detail: typeof responseData === "string" ? responseData : responseData.detail
      });
    }

    return res.status(502).json({
      success: false,
      message: "The AI roadmap service could not be reached."
    });
  }
});

export default router;
