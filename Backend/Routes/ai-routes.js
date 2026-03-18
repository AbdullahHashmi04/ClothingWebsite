import express from "express";
import { callClaude } from "./claude-ai.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const response = await callClaude(message);
    res.json({ success: true, response });

  } catch (error) {
    console.error("Error in /chat route:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to get response from Claude" 
    });
  }
});

export default router;