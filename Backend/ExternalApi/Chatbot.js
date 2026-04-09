import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
        model: "llama-3.3-70b-versatile", // or "mixtral-8x7b-32768", "gemma2-9b-it"
        messages: [
            { role: "system", content: "You are a helpful ecommerce assistant." },
            { role: "user", content: req.body.message }
        ]
    },
    {
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        }
    }
);
res.json(response.data.choices[0].message.content);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

export default router;