import express from "express";
import axios from "axios";

const router = express.Router();
router.post("/", async (req, res) => {
    try {
        console.log("Loading Gemini 2.5 Flash...");

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: "You are a helpful ecommerce assistant." },
                            { text: req.body.message }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "x-goog-api-key": process.env.GOOGLE_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply =
            response.data.candidates[0].content.parts[0].text;

        res.json(reply);

    } catch (err) {
        console.error("Gemini Error:", err.response?.data || err.message);
        res.status(500).send("Error");
    }
});
export default router;