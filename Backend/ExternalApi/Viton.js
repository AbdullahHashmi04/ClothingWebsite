import express from "express";
import cors from "cors";
import multer from "multer";
import { Client } from "@gradio/client"; // npm install @gradio/client

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Convert a multer file buffer to a Blob
function bufferToBlob(file) {
  return new Blob([file.buffer], { type: file.mimetype });
}

router.post(
  "/",
  upload.fields([
    { name: "person", maxCount: 1 },
    { name: "cloth", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const garment_des = req.body?.garment_des || "clothing item";

      const personFile = req.files?.person?.[0];
      const clothFile = req.files?.cloth?.[0];

      if (!personFile || !clothFile) {
        return res.status(400).json({
          success: false,
          message: "Both person image and cloth image are required",
        });
      }

      const humanBlob = bufferToBlob(personFile);
      const garmBlob = bufferToBlob(clothFile);

      console.log("Connecting to Hugging Face...");
      const client = await Client.connect("yisol/IDM-VTON");

      console.log("Sending to model (this may take time)...");

      const result = await client.predict("/tryon", [
        { "background": humanBlob, "layers": [], "composite": null },
        garmBlob,
        garment_des,
        true,           // is_checked (auto-mask)
        false,          // is_checked_crop
        30,             // denoise_steps
        42              // seed
      ]);

      const outputImage = result.data[0];

      res.json({
        success: true,
        result_url: outputImage.url,
      });

    } catch (error) {
      console.error("Viton error:", error);

      const status = error.response?.status || error.status;
      const msg = error.message || "";

      if (status === 402) {
        return res.status(402).json({
          success: false,
          message: "Virtual try-on service has insufficient credit. Please contact the admin.",
        });
      }

      if (msg.toLowerCase().includes("no gpu") || msg.toLowerCase().includes("gpu")) {
        return res.status(503).json({
          success: false,
          message: "The AI model is currently busy (no GPU available). Please try again in a few minutes.",
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Virtual try-on failed. Please try again.",
      });
    }
  }
);

export default router;