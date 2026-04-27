import express from "express";
import Replicate from "replicate";
import multer from "multer"
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../Config/cloudinary.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const router = express.Router();
const hasRealEnvValue = (value) => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return ![
    "undefined",
    "null",
    "your_cloud_name",
    "your_api_key",
    "your_api_secret",
    "change_me",
  ].includes(normalized);
};

const cloudinaryConfigured = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].every(hasRealEnvValue);

const storage = cloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    })
  : multer.memoryStorage();

const upload = multer({ storage });

// Initialize Replicate client using env token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

function bufferToDataURI(buffer, mimeType = "image/jpeg") {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Build a Replicate-compatible image input from multer file object.
 * Supports both:
 * 1) Cloudinary storage (file.path / file.secure_url / file.url)
 * 2) Memory/disk uploads with file.buffer
 */
function fileToReplicateInput(file, label) {
  if (!file) {
    throw new Error(`${label} image file is missing`);
  }

  if (typeof file.path === "string" && /^https?:\/\//i.test(file.path)) {
    return file.path;
  }

  if (typeof file.secure_url === "string" && /^https?:\/\//i.test(file.secure_url)) {
    return file.secure_url;
  }

  if (typeof file.url === "string" && /^https?:\/\//i.test(file.url)) {
    return file.url;
  }

  if (file.buffer && Buffer.isBuffer(file.buffer)) {
    return bufferToDataURI(file.buffer, file.mimetype || "image/jpeg");
  }

  throw new Error(
    `${label} image has no usable source. Expected Cloudinary URL or file buffer.`
  );
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
      const category = req.body?.category || "upper_body"; // upper_body, lower_body, dresses

      const personFile = req.files?.person?.[0];
      const clothFile = req.files?.cloth?.[0];

      if (!personFile || !clothFile) {
        return res.status(400).json({
          success: false,
          message: "Both person image and cloth image are required",
        });
      }

      // Convert upload objects to Replicate image inputs (URL or data URI)
      const humanImgURI = fileToReplicateInput(personFile, "Person");
      const garmImgURI = fileToReplicateInput(clothFile, "Cloth");

      console.log("🔄 Sending images to Replicate IDM-VTON...");
      console.log(`   Person image size: ${personFile.size ?? "unknown"} bytes`);
      console.log(`   Cloth image size:  ${clothFile.size ?? "unknown"} bytes`);
      console.log(`   Category: ${category}`);

      // Run the IDM-VTON model on Replicate
      const output = await replicate.run("cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985", {
        input: {
          human_img: humanImgURI,
          garm_img: garmImgURI,
          garment_des: garment_des,
          category: category,
          crop: false,
          seed: 42,
          steps: 30,
          force_dc: false,
          mask_only: false,
        },
      });

      console.log("✅ Replicate IDM-VTON response received");

      // The output is typically a URL string to the result image
      // It could also be a ReadableStream or other format
      let resultUrl;

      if (typeof output === "string") {
        resultUrl = output;
      } else if (output?.url) {
        resultUrl = output.url();
      } else if (Array.isArray(output) && output.length > 0) {
        resultUrl = typeof output[0] === "string" ? output[0] : output[0]?.url?.() || output[0];
      } else {
        // If it's a ReadableStream, read it
        const chunks = [];
        for await (const chunk of output) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks.map(c => typeof c === 'string' ? Buffer.from(c) : c));
        const base64Result = buffer.toString("base64");
        resultUrl = `data:image/png;base64,${base64Result}`;
      }

      console.log("✅ Result URL obtained:", typeof resultUrl === 'string' ? resultUrl.substring(0, 80) + '...' : 'data URI');

      res.json({
        success: true,
        result_url: resultUrl,
      });
    } catch (error) {
      console.error("❌ IDM-VTON Replicate error:", error);

      const status = error.response?.status || error.status;
      const msg = error.message || "";

      if (status === 402 || msg.includes("payment") || msg.includes("billing")) {
        return res.status(402).json({
          success: false,
          message:
            "Replicate API has insufficient credit. Please add billing to your Replicate account.",
        });
      }

      if (status === 401 || msg.includes("Unauthenticated")) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid Replicate API token. Please check your REPLICATE_API_TOKEN in the .env file.",
        });
      }

      if (status === 422) {
        return res.status(422).json({
          success: false,
          message:
            "Invalid input images. Please ensure both images are valid and try again.",
          detail: msg,
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