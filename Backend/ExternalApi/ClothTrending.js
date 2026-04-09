import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'
import axios from 'axios'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// ── Curated Pakistani regional fashion data ───────────────────────────────────
// 24 hand-crafted entries across 8 regions. Rich, accurate descriptions.
const PAKISTAN_FASHION_DATA = [
  {
    region: "Punjab",
    style: "Phulkari Embroidered Lawn Suit",
    category: "Traditional",
    description: "Lahore's signature phulkari — vibrant silk thread embroidery passed down through generations — adorns flowing lawn suits. Gold thread and mirror work make this a staple at mehndi ceremonies.",
    searchQuery: "pakistani embroidered women traditional lawn suit colorful",
    popular_in: "Lahore, Punjab",
  },
  {
    region: "Punjab",
    style: "Gota Kinara Bridal Lehenga",
    category: "Wedding Wear",
    description: "Gold gota lace trims every edge of these richly embroidered bridal lehengas. A Lahori bridal staple merging Mughal-era opulence with modern silhouettes in deep reds and magentas.",
    searchQuery: "pakistani bridal lehenga gold embroidery red wedding dress",
    popular_in: "Lahore, Punjab",
  },
  {
    region: "Punjab",
    style: "Digital Printed Lawn Co-ord",
    category: "Casual",
    description: "Pakistan's fashion capital exports the finest printed lawn globally. Bold floral and geometric prints in summer pastels make this the most-worn wardrobe staple across Punjab.",
    searchQuery: "pakistani women lawn printed summer casual fashion",
    popular_in: "Faisalabad, Punjab",
  },
  {
    region: "Punjab",
    style: "Patiala Salwar with Kurti",
    category: "Fusion",
    description: "The dramatic flare of Patiala salwars paired with cropped kurtis is making a comeback in Lahore's upscale cafes and markets — bold, feminine, and unapologetically fun.",
    searchQuery: "patiala salwar traditional punjabi women colorful fashion",
    popular_in: "Lahore, Punjab",
  },
  {
    region: "Sindh",
    style: "Ajrak Block-Printed Kurta",
    category: "Traditional",
    description: "Ajrak, Sindh's centuries-old resist-printed textile, features geometric indigo and crimson patterns. UNESCO-recognized, these kurtas are a powerful and growing cultural fashion statement.",
    searchQuery: "ajrak sindhi traditional blue red printed fabric kurta",
    popular_in: "Hyderabad, Sindh",
  },
  {
    region: "Sindh",
    style: "Sindhi Mirror-Work Ghaghra",
    category: "Traditional",
    description: "Craftswomen stitch hundreds of tiny mirrors onto vibrant ghaghra-cholis in fiery reds and oranges. Wedding staples that shimmer with every movement, worn from Sukkur to Larkana.",
    searchQuery: "mirror work embroidery colorful traditional dress women south asia",
    popular_in: "Sukkur, Sindh",
  },
  {
    region: "Sindh",
    style: "Fusion Lawn Co-ord Set",
    category: "Fusion",
    description: "Karachi's fashion-forward crowd reinvents traditional lawn into co-ord sets with palazzo trousers and cropped kameez. Bold prints meet minimalist silhouettes for the modern Sindhi woman.",
    searchQuery: "modern pakistani women fashion co-ord set palazzo outfit",
    popular_in: "Karachi, Sindh",
  },
  {
    region: "Sindh",
    style: "Sindhi Topi & Ajrak Shawl",
    category: "Traditional",
    description: "On Sindhi Culture Day, Karachi turns into a sea of Sindhi topis and ajrak-draped shoulders. Youth are reclaiming this identity year-round as a proud, everyday fashion statement.",
    searchQuery: "sindhi traditional cap culture ajrak men heritage celebration",
    popular_in: "Karachi, Sindh",
  },
  {
    region: "KPK",
    style: "Pashtun Khet Partug with Waistcoat",
    category: "Traditional",
    description: "The Pashtun khet partug — wide cotton trousers with a long qmais and embroidered waistcoat — is the proud daily dress of Peshawari men and a symbol of Pashtun identity.",
    searchQuery: "pakistani pashtun traditional men kameez waistcoat cream white",
    popular_in: "Peshawar, KPK",
  },
  {
    region: "KPK",
    style: "Chitrali Wool Suit & Pakol",
    category: "Traditional",
    description: "The pakol cap, hand-spun from natural Chitrali wool, sits atop layered woollen kurtas in earthy tones. A mountain-culture icon worn from Chitral to Gilgit as everyday highland dress.",
    searchQuery: "traditional wool mountain men clothing cap central asia heritage",
    popular_in: "Chitral, KPK",
  },
  {
    region: "KPK",
    style: "Afghan Chapan Coat",
    category: "Fusion",
    description: "Peshawar's cross-border trade brings the richly striped chapan coat into local fashion — draped over shalwar kameez as a regal evening statement piece, blending Pashtun and Afghan craft.",
    searchQuery: "central asian chapan coat striped colorful traditional men fashion",
    popular_in: "Peshawar, KPK",
  },
  {
    region: "Balochistan",
    style: "Balochi Embroidered Dress",
    category: "Traditional",
    description: "Balochi hand-embroidery takes months to complete — intricate geometric and floral patterns in vivid thread cover entire garments in a labor of love and deep cultural pride unique to Quetta.",
    searchQuery: "balochi embroidered colorful traditional dress women south asia",
    popular_in: "Quetta, Balochistan",
  },
  {
    region: "Balochistan",
    style: "Makrani Thread-Work Shawl",
    category: "Traditional",
    description: "Coastal Makran women craft stunning heavily-embroidered shawls with Sindhi-influenced patterns — a unique fusion of two ancient textile cultures at the Arabian Sea's edge.",
    searchQuery: "traditional embroidered shawl tribal women south asia colorful",
    popular_in: "Turbat, Balochistan",
  },
  {
    region: "Balochistan",
    style: "Brahui Embroidered Vest & Cap",
    category: "Traditional",
    description: "The Brahui embroidered vest in deep burgundy with silver thread work, paired with a traditional cap, is Quetta's most recognizable men's ensemble and a cultural pride symbol.",
    searchQuery: "traditional embroidered vest men cap south asia cultural heritage",
    popular_in: "Quetta, Balochistan",
  },
  {
    region: "Islamabad",
    style: "Modest Structured Office Suit",
    category: "Formal",
    description: "Islamabad's corporate culture drives demand for tailored kameez in structured fabrics — minimal embellishment, clean lines, and premium pret labels. Modest, elegant, and boardroom-ready.",
    searchQuery: "pakistani women formal office modest fashion elegant tailored",
    popular_in: "Islamabad",
  },
  {
    region: "Islamabad",
    style: "Urban East-Meets-West Streetwear",
    category: "Streetwear",
    description: "Young Islamabadis pair wide-leg shalwar with graphic tees and sneakers — a bold East-meets-West streetwear aesthetic blowing up on Pakistani social media and fashion influencer feeds.",
    searchQuery: "south asian modern streetwear fashion youth casual urban colorful",
    popular_in: "Islamabad",
  },
  {
    region: "Islamabad",
    style: "Premium Pret Embellished Maxi",
    category: "Wedding Wear",
    description: "Islamabad's elite pret studios craft heavily embellished chiffon maxis for weddings — floor-length gowns blending South Asian craft with Western draping in ivory, sage, and dusty rose.",
    searchQuery: "pakistani wedding party chiffon embellished women evening dress",
    popular_in: "Islamabad",
  },
  {
    region: "Karachi",
    style: "Breezy Linen Beach Kurta",
    category: "Casual",
    description: "Karachi's coastal heat inspires breezy linen kurtas in ocean-inspired teals and sandy neutrals. Perfect for Clifton evenings, Sea View strolls, and casual beach gatherings.",
    searchQuery: "casual linen kurta light summer men beach beige teal south asia",
    popular_in: "Karachi",
  },
  {
    region: "Karachi",
    style: "High-Street Designer Abaya",
    category: "Western",
    description: "Karachi's fashion houses reimagine the abaya with structured shoulders, belt cinching, and subtle pastel gradients — modesty meets high-street luxury for the contemporary Pakistani woman.",
    searchQuery: "modern designer abaya modest fashion elegant women black belt",
    popular_in: "Karachi",
  },
  {
    region: "Gilgit-Baltistan",
    style: "Hunza Handmade Felt Coat",
    category: "Traditional",
    description: "Hand-felted from mountain sheep wool, the Hunza coat features bold geometric borders in natural dyes. Embraced by trail-fashion globally, it is the heart of Gilgit-Baltistan's cultural identity.",
    searchQuery: "traditional mountain wool felt coat geometric embroidery central asia men",
    popular_in: "Hunza, GB",
  },
  {
    region: "Gilgit-Baltistan",
    style: "Baltit Layered Wool Kurti",
    category: "Casual",
    description: "Skardu's frigid winters demand thick layered wool kurtis over thermal shalwar — dyed in deep earth tones inspired by Karakoram rock faces and glacial blues of the Shigar valley.",
    searchQuery: "mountain traditional clothing women layers wool brown heritage",
    popular_in: "Skardu, GB",
  },
  {
    region: "Multan",
    style: "Blue Pottery Print Cotton Suit",
    category: "Traditional",
    description: "Multan's iconic blue pottery patterns — white base with cobalt geometric tile designs — are screen-printed onto breathable cotton suits, creating wearable art from the City of Saints.",
    searchQuery: "blue pottery print traditional south asian cotton dress women geometric",
    popular_in: "Multan, Punjab",
  },
  {
    region: "Multan",
    style: "Ancient Soosi Stripe Shalwar Kameez",
    category: "Traditional",
    description: "Soosi, Multan's ancient cotton-silk blend with fine horizontal stripes, makes the most breathable summer shalwar kameez. Weavers at Bazaar Weavers' Colony keep this centuries-old craft alive.",
    searchQuery: "traditional striped cotton silk fabric kurta south asia men women",
    popular_in: "Multan, South Punjab",
  },
  {
    region: "Multan",
    style: "Multani Heer Embroidery Dupatta",
    category: "Wedding Wear",
    description: "The dense, jewel-toned Heer embroidery of Multan transforms plain dupattas into heirlooms — heavily worked in silk thread with motifs of peacocks, flowers, and geometric fills for brides.",
    searchQuery: "traditional embroidered dupatta colorful women wedding south asia",
    popular_in: "Multan, Punjab",
  },
];

// ── In-memory cache (30 min) ────────────────────────────────────────────────
let cache = {};
const CACHE_MS = 30 * 60 * 1000;

// ── Fetch one portrait photo from Pexels ───────────────────────────────────
async function fetchPexelsImage(query, apiKey) {
  try {
    const resp = await axios.get('https://api.pexels.com/v1/search', {
      headers: { Authorization: apiKey },
      params: { query, per_page: 3, orientation: 'portrait', size: 'large' },
      timeout: 6000,
    });
    const photos = resp.data?.photos;
    if (photos && photos.length > 0) {
      // Pick a varied result so cards aren't all identical for similar queries
      const pick = photos[Math.floor(Math.random() * photos.length)];
      return pick.src.large2x || pick.src.large;
    }
  } catch (e) {
    // Non-fatal — just return null, frontend uses gradient fallback
    console.warn(`[Pexels] "${query}":`, e.message);
  }
  return null;
}

// Batch with tiny delay to stay inside Pexels' 200 req/hr free tier
async function enrichWithImages(items, apiKey) {
  const BATCH = 5;
  const DELAY = 300;
  const results = [];
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    const imgs = await Promise.all(batch.map(item => fetchPexelsImage(item.searchQuery, apiKey)));
    imgs.forEach((image_url, j) => results.push({ ...batch[j], image_url }));
    if (i + BATCH < items.length) await new Promise(r => setTimeout(r, DELAY));
  }
  return results;
}

// ── Route: GET /trending?region=Punjab ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const region = req.query.region || 'All';
    const cacheKey = region;
    const now = Date.now();

    if (cache[cacheKey] && (now - cache[cacheKey].ts < CACHE_MS)) {
      return res.json(cache[cacheKey].data);
    }

    let data = region === 'All'
      ? PAKISTAN_FASHION_DATA
      : PAKISTAN_FASHION_DATA.filter(item => item.region === region);

    const pexelsKey = process.env.PEXELS_API_KEY;
    let enriched;

    if (pexelsKey) {
      console.log(`[ClothTrending] Fetching Pexels images for region="${region}" (${data.length} items)…`);
      enriched = await enrichWithImages(data, pexelsKey);
    } else {
      console.warn('[ClothTrending] PEXELS_API_KEY not set — returning data without images.');
      enriched = data.map(item => ({ ...item, image_url: null }));
    }

    cache[cacheKey] = { ts: now, data: enriched };
    res.json(enriched);
  } catch (e) {
    console.error('[ClothTrending] Error:', e.message);
    res.status(500).json({ error: 'Failed to load trending data', details: e.message });
  }
});

export default router;