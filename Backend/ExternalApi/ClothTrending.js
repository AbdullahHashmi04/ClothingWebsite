import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'
import axios from 'axios'

const router = express.Router()

// Build an Unsplash image URL from the AI-provided image_keyword
function resolveImageUrl(item, index) {
    const keyword = encodeURIComponent(item.image_keyword || item.style || 'pakistani fashion');
    // Use a stable seed based on index so each card gets a consistent image
    return `https://source.unsplash.com/600x800/?${keyword}&sig=${index}`;
}

function extractJSON(raw) {
    let text = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) {
        throw new Error(`No JSON array found: ${text.slice(0, 300)}`);
    }
    return JSON.parse(text.slice(start, end + 1));
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });



router.get('/', async (req, res) => {
    try {
        const prompt = `You are a Pakistani fashion stylist.

Return ONLY valid JSON with no markdown, no code fences, no explanation.

Format (array of 12 objects):
[
 {
   "style": "Full readable style name",
   "category": "One of: Traditional | Fusion | Western | Formal | Casual | Streetwear | Wedding Wear",
   "image_keyword": "2-3 word garment name e.g. embroidered kurta or palazzo pants",
   "popular_in": "City or region in Pakistan",
   "description": "One sentence about why this style is trending right now"
 }
]

Generate 12 currently trending clothing styles in Pakistan for this season.`;

        console.log("Loading Gemini for ClothTrending...");

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

        const parsed = extractJSON(trend.data.choices[0].message.content);

        // Enrich every item with a resolved image_url before sending to frontend
        const enriched = parsed.map((item, i) => ({
            ...item,
            image_url: resolveImageUrl(item, i),
        }));
        res.json(enriched);
    } catch (e) {
        console.error("ClothTrending error:", e.message);
        res.status(500).json({ error: "Failed to parse model response", details: e.message });
    }
});


export default router;