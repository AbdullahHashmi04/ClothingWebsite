import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openrouter/free",
                messages: [
                    { role: "system", content: "You are a helpful ecommerce assistant." },
                    { role: "user", content: req.body.message }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
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