import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["Active", "Expired", "Scheduled"],
        default: "Active",
    },
    expiry: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        enum: ["Percentage", "Fixed Amount", "Free Shipping"],
        default: "Percentage",
    },
    minOrder: {
        type: Number,
        min: 0,
        default: 0,
    },
    usageLimit: {
        type: Number,
        min: 0,
        default: 0,
    },
    usageCount: {
        type: Number,
        min: 0,
        default: 0,
    },
    applyScope: {
        type: String,
        enum: ["all", "category"],
        default: "all",
    },
    targetCategory: {
        type: String,
        trim: true,
        default: "",
    },
}, { timestamps: true })

const Discount = mongoose.model("Discount", discountSchema)
export default Discount