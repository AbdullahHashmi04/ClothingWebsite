import express from 'express';
import axios from 'axios';

const router  = express.Router();
// ─── Geocoding ────────────────────────────────────────────────────────────────
const getCoordinates = async (city) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const res = await axios.get(url, { timeout: 8000 });
    if (!res.data.results || res.data.results.length === 0)
        throw new Error(`City "${city}" not found`);
    const { latitude, longitude, name, country } = res.data.results[0];
    return { latitude, longitude, name, country };
};

// ─── WMO weather code → human label + emoji ──────────────────────────────────
const describeCode = (code) => {
    if (code === 0)              return { label: "Clear sky",           emoji: "☀️" };
    if (code === 1)              return { label: "Mainly clear",        emoji: "🌤️" };
    if (code === 2)              return { label: "Partly cloudy",       emoji: "⛅" };
    if (code === 3)              return { label: "Overcast",            emoji: "☁️" };
    if ([45,48].includes(code))  return { label: "Fog",                 emoji: "🌫️" };
    if ([51,53,55].includes(code)) return { label: "Drizzle",           emoji: "🌦️" };
    if ([56,57].includes(code))  return { label: "Freezing drizzle",    emoji: "🌨️" };
    if ([61,63,65].includes(code)) return { label: "Rain",              emoji: "🌧️" };
    if ([66,67].includes(code))  return { label: "Freezing rain",       emoji: "🌨️" };
    if ([71,73,75].includes(code)) return { label: "Snow",              emoji: "❄️" };
    if (code === 77)             return { label: "Snow grains",         emoji: "🌨️" };
    if ([80,81,82].includes(code)) return { label: "Rain showers",      emoji: "🌧️" };
    if ([85,86].includes(code))  return { label: "Snow showers",        emoji: "🌨️" };
    if ([95].includes(code))     return { label: "Thunderstorm",        emoji: "⛈️" };
    if ([96,99].includes(code))  return { label: "Thunderstorm + hail", emoji: "⛈️" };
    return { label: "Unknown", emoji: "🌡️" };
};

// ─── Clothing recommendations ─────────────────────────────────────────────────
const RAIN_CODES  = [51,53,55,56,57,61,63,65,66,67,80,81,82,85,86,95,96,99];
const SNOW_CODES  = [71,73,75,77,85,86];
const STORM_CODES = [95,96,99];

const getClothing = (minTemp, maxTemp, code) => {
    const avg  = (minTemp + maxTemp) / 2;
    const rain = RAIN_CODES.includes(code);
    const snow = SNOW_CODES.includes(code);
    const storm= STORM_CODES.includes(code);
    const items = [];

    // Base layer (use avg temp for a more realistic feel-of-day assessment)
    if (avg < 0) {
        items.push(
            { item: "Thermal undershirt",    category: "base",  icon: "🧥" },
            { item: "Thick wool sweater",    category: "mid",   icon: "🧶" },
            { item: "Heavy winter coat",     category: "outer", icon: "🧥" },
            { item: "Thermal leggings",      category: "base",  icon: "👖" },
            { item: "Winter boots",          category: "feet",  icon: "👢" },
            { item: "Wool gloves",           category: "acc",   icon: "🧤" },
            { item: "Beanie / Ear muffs",    category: "acc",   icon: "🧢" },
        );
    } else if (avg < 8) {
        items.push(
            { item: "Long-sleeve thermal",   category: "base",  icon: "👕" },
            { item: "Fleece or pullover",    category: "mid",   icon: "🧶" },
            { item: "Puffer / Wool jacket",  category: "outer", icon: "🧥" },
            { item: "Thick jeans / chinos",  category: "bottom",icon: "👖" },
            { item: "Ankle boots",           category: "feet",  icon: "👟" },
            { item: "Light gloves",          category: "acc",   icon: "🧤" },
        );
    } else if (avg < 15) {
        items.push(
            { item: "Long-sleeve shirt",     category: "base",  icon: "👕" },
            { item: "Light jacket / hoodie", category: "outer", icon: "🧥" },
            { item: "Jeans / trousers",      category: "bottom",icon: "👖" },
            { item: "Sneakers",              category: "feet",  icon: "👟" },
        );
    } else if (avg < 22) {
        items.push(
            { item: "Cotton T-shirt",        category: "base",  icon: "👕" },
            { item: "Light cardigan",        category: "outer", icon: "🧥" },
            { item: "Chinos / light jeans",  category: "bottom",icon: "👖" },
            { item: "Sneakers / loafers",    category: "feet",  icon: "👟" },
        );
    } else if (avg < 28) {
        items.push(
            { item: "Breathable T-shirt",    category: "base",  icon: "👕" },
            { item: "Shorts or light pants", category: "bottom",icon: "🩳" },
            { item: "Lightweight sneakers",  category: "feet",  icon: "👟" },
            { item: "Sunglasses",            category: "acc",   icon: "🕶️" },
        );
    } else {
        items.push(
            { item: "Linen / moisture-wick shirt", category: "base",  icon: "👕" },
            { item: "Shorts / linen pants",        category: "bottom",icon: "🩳" },
            { item: "Sandals / light shoes",       category: "feet",  icon: "🥿" },
            { item: "Sunglasses",                  category: "acc",   icon: "🕶️" },
            { item: "Hat / cap",                   category: "acc",   icon: "🧢" },
            { item: "Sunscreen",                   category: "acc",   icon: "🧴" },
        );
    }

    // Weather-driven add-ons
    if (snow) {
        items.push(
            { item: "Waterproof snow boots", category: "feet", icon: "👢" },
            { item: "Heavy scarf",           category: "acc",  icon: "🧣" },
        );
    } else if (rain) {
        items.push(
            { item: "Compact umbrella",      category: "acc",  icon: "☂️" },
            { item: "Waterproof jacket",     category: "outer",icon: "🧥" },
            { item: "Waterproof shoes",      category: "feet", icon: "👟" },
        );
    }
    if (storm) {
        items.push({ item: "Stay indoors if possible", category: "tip", icon: "⚠️" });
    }

    return items;
};

// ─── Route: GET /api/weather/weekly/:city ─────────────────────────────────────
router.get('/weekly/:city', async (req, res) => {
    try {
        const { latitude, longitude, name, country } = await getCoordinates(req.params.city);

        // Request both max AND min temps, plus precipitation sum for extra context
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max` +
            `&timezone=auto` +
            `&forecast_days=7`;

        const weatherRes = await axios.get(weatherUrl, { timeout: 8000 });
        const {
            time,
            temperature_2m_max,
            temperature_2m_min,
            weathercode,
            precipitation_sum,
            windspeed_10m_max,
        } = weatherRes.data.daily;

        const forecast = time.map((date, i) => {
            const maxTemp  = temperature_2m_max[i];
            const minTemp  = temperature_2m_min[i];
            const code     = weathercode[i];
            const precip   = precipitation_sum[i];
            const wind     = windspeed_10m_max[i];
            const { label, emoji } = describeCode(code);

            return {
                date,
                maxTemp,
                minTemp,
                code,
                condition: label,
                emoji,
                precipitation: precip,   // mm
                wind,                    // km/h
                clothes: getClothing(minTemp, maxTemp, code),
            };
        });

        res.json({
            city: name,
            country,
            latitude,
            longitude,
            forecast,
        });

    } catch (err) {
        const status = err.message.includes("not found") ? 404 : 500;
        res.status(status).json({ error: err.message });
    }
});

export default router;