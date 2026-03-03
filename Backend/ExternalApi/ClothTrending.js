import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'
import axios from 'axios'

const router = express.Router()


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });



router.get('/', async (req, res) => {
    try {
        const prompt = `You are a Pakistani fashion stylist.

Return ONLY valid JSON.
Do not use markdown.
Do not explain anything.

Format:
[
 { "style": "", "category": "", "image_keyword": "single_keyword_only", "popular_in": "" }
]

Generate 12 trending clothing styles in Pakistan.`

console.log("Loading");
        const trend = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openrouter/free",
            messages: [
                { role: "system", content: "You are a helpful ecommerce assistant." },
                { role: "user", content: prompt }
            ]
        },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        const parsed = JSON.parse(trend.data.choices[0].message.content);
        res.json(parsed);
    } catch (e) {
        res.status(500).json({ error: "Failed to parse model response" });
    }
});


export default router;