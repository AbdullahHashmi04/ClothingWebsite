import express from "express";
import jwt from "jsonwebtoken";
import { Credentials } from "../Model/Credentials.js";
import dotenv from "dotenv";
dotenv.config();


const router = express.Router();

router.post("/", async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const user = await Credentials.findOne({ Email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Handle both legacy plaintext and bcrypt-hashed passwords
        let isMatch = false;
        if (user.Password && user.Password.startsWith("$2")) {
            isMatch = await user.comparePassword(Password);
        } else {
            // Legacy plaintext password — verify then upgrade to bcrypt
            isMatch = user.Password === Password;
            if (isMatch) {
                user.Password = Password;
                await user.save(); // pre-save hook hashes it
            }
        }
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id ,role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({ token, query: user });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
})

export default router;