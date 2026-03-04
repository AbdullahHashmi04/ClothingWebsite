import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'
import axios from 'axios'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// ─── Curated Pakistani Fashion Image Library ─────────────────────────────────
const FASHION_IMAGE_LIBRARY = {
    "shalwar kameez": "https://images.unsplash.com/photo-1585914641050-fa5b9da4b6e7?w=600&q=85",
    "shalwar": "https://images.unsplash.com/photo-1585914641050-fa5b9da4b6e7?w=600&q=85",
    "kameez": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85",
    "pastel": "https://images.unsplash.com/photo-1594938298603-c8148c4b4c6e?w=600&q=85",
    "lawn suit": "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=85",
    "lawn": "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=85",
    "a-line": "https://images.unsplash.com/photo-1600107131986-61edc5dd8f36?w=600&q=85",
    "peplum": "https://images.unsplash.com/photo-1615886753866-79396abc4b1a?w=600&q=85",
    "kurta": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85",
    "kurti": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85",
    "embroidered": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "embroidery": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "chikankari": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85",
    "ankara": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85",
    "lehenga": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85",
    "sharara": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85",
    "bridal": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "ghagra": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85",
    "pishwas": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "anarkali": "https://images.unsplash.com/photo-1610365000817-bb8f6281b9c7?w=600&q=85",
    "frock": "https://images.unsplash.com/photo-1610365000817-bb8f6281b9c7?w=600&q=85",
    "gharara": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85",
    "churidar": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "dupatta": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85",
    "shawl": "https://images.unsplash.com/photo-1613745515598-f930f3aef0a0?w=600&q=85",
    "woolen": "https://images.unsplash.com/photo-1613745515598-f930f3aef0a0?w=600&q=85",
    "kashmiri": "https://images.unsplash.com/photo-1613745515598-f930f3aef0a0?w=600&q=85",
    "organza": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "palazzo": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85",
    "cigarette": "https://images.unsplash.com/photo-1594938298603-c8148c4b4c6e?w=600&q=85",
    "dhoti": "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=85",
    "trousers": "https://images.unsplash.com/photo-1594938298603-c8148c4b4c6e?w=600&q=85",
    "pants": "https://images.unsplash.com/photo-1594938298603-c8148c4b4c6e?w=600&q=85",
    "leggings": "https://images.unsplash.com/photo-1594938298603-c8148c4b4c6e?w=600&q=85",
    "crop": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85",
    "maxi": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85",
    "midi": "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&q=85",
    "skirt": "https://images.unsplash.com/photo-1596820695049-6d2555c04576?w=600&q=85",
    "blouse": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85",
    "tunic": "https://images.unsplash.com/photo-1600107131986-61edc5dd8f36?w=600&q=85",
    "coord": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85",
    "saree": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "sari": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "suit": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=85",
    "pantsuit": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=85",
    "pathani": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=85",
    "sherwani": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=85",
    "waistcoat": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=85",
    "denim": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85",
    "jeans": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85",
    "fusion": "https://images.unsplash.com/photo-1589810635657-232948472d98?w=600&q=85",
    "indo-western": "https://images.unsplash.com/photo-1589810635657-232948472d98?w=600&q=85",
    "indo western": "https://images.unsplash.com/photo-1589810635657-232948472d98?w=600&q=85",
    "block print": "https://images.unsplash.com/photo-1585914641050-fa5b9da4b6e7?w=600&q=85",
    "printed": "https://images.unsplash.com/photo-1585914641050-fa5b9da4b6e7?w=600&q=85",
    "floral": "https://images.unsplash.com/photo-1585914641050-fa5b9da4b6e7?w=600&q=85",
    "silk": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "velvet": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "cotton": "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=85",
    "chiffon": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "linen": "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=85",
    "lace": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85",
    "wedding": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "festive": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "eid": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "summer": "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=85",
    "winter": "https://images.unsplash.com/photo-1613745515598-f930f3aef0a0?w=600&q=85",
    "traditional": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "casual": "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=85",
    "formal": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=85",
    "streetwear": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85",
    "fashion": "https://images.unsplash.com/photo-1589810635657-232948472d98?w=600&q=85",
};

const FALLBACK_POOL = [
    "https://images.unsplash.com/photo-1585914641050-fa5b9da4b6e7?w=600&q=85",
    "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=85",
    "https://images.unsplash.com/photo-1600107131986-61edc5dd8f36?w=600&q=85",
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=85",
    "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&q=85",
    "https://images.unsplash.com/photo-1613745515598-f930f3aef0a0?w=600&q=85",
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=85",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85",
    "https://images.unsplash.com/photo-1589810635657-232948472d98?w=600&q=85",
    "https://images.unsplash.com/photo-1610365000817-bb8f6281b9c7?w=600&q=85",
];

function resolveImageUrl(item, index) {
    const style = (item.style || "").toLowerCase().trim();
    const keyword = (item.image_keyword || "").toLowerCase().trim();
    const category = (item.category || "").toLowerCase().trim();

    if (FASHION_IMAGE_LIBRARY[style]) return FASHION_IMAGE_LIBRARY[style];
    if (FASHION_IMAGE_LIBRARY[keyword]) return FASHION_IMAGE_LIBRARY[keyword];

    for (const [key, url] of Object.entries(FASHION_IMAGE_LIBRARY)) {
        if (style.includes(key)) return url;
    }
    for (const [key, url] of Object.entries(FASHION_IMAGE_LIBRARY)) {
        if (keyword.includes(key)) return url;
    }

    if (FASHION_IMAGE_LIBRARY[category]) return FASHION_IMAGE_LIBRARY[category];
    return FALLBACK_POOL[index % FALLBACK_POOL.length];
}


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

        const trend = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            { contents: [{ parts: [{ text: prompt }] }] },
            {
                headers: {
                    "x-goog-api-key": process.env.GOOGLE_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        let textResponse = trend.data.candidates[0].content.parts[0].text.trim();
        // Strip markdown fences if Gemini wraps the JSON
        textResponse = textResponse
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

        const parsed = JSON.parse(textResponse);

        // Enrich every item with a resolved image_url before sending to frontend
        const enriched = parsed.map((item, i) => ({
            ...item,
            image_url: resolveImageUrl(item, i),
        }));

        res.json(enriched);

    } catch (e) {
        console.error("ClothTrending error:", e.response?.data || e.message);
        res.status(500).json({ error: "Failed to parse model response" });
    }
});

export default router;