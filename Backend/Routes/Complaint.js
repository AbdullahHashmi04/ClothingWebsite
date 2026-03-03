import express from "express";
import Complaint from "../Model/Complaint.js";

const router = express.Router();

// Create a complaint
router.post("/", async (req, res) => {
  try {
    const { orderId, email, subject, description } = req.body;
    if (!orderId || !email || !subject || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const complaint = new Complaint({ orderId, email, subject, description });
    await complaint.save();
    res.status(201).json({ message: "Complaint filed successfully", complaint });
  } catch (err) {
    console.error("Error filing complaint:", err);
    res.status(500).json({ error: "Failed to file complaint" });
  }
});

// Get complaints by email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const complaints = await Complaint.find({ email }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Get all complaints (admin)
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

export default router;
