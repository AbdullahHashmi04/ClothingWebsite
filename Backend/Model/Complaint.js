import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "OrderDetails", required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "Open" },
  createdAt: { type: Date, default: Date.now },
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);

export default Complaint;
