import { useState, useCallback, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import CartContext from "../../Context/CartContext";
import "../../../Style/Wearcast.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:3000/api/weather";
const DAYS     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Maps weather label → product categories to highlight
// category values in DB: shirts, pants, Jeans, dresses, jackets, shoes, accessories, other, men, women, kids
const WEATHER_CATEGORY_MAP = {
  /* Base "what to wear" → DB categories */
  cold:    ["jackets", "shirts", "pants", "Jeans"],
  cool:    ["jackets", "shirts", "pants", "Jeans"],
  mild:    ["shirts", "pants", "Jeans", "dresses"],
  warm:    ["shirts", "dresses", "accessories"],
  hot:     ["shirts", "dresses", "accessories", "shoes"],
  rainy:   ["jackets", "shoes", "accessories"],
  snowy:   ["jackets", "shoes", "accessories"],
};

/** Decide which bucket to use from temp avg */
const getWeatherBucket = (minTemp, maxTemp, code) => {
  const avg = (minTemp + maxTemp) / 2;
  const RAIN_CODES  = [51,53,55,56,57,61,63,65,66,67,80,81,82,85,86,95,96,99];
  const SNOW_CODES  = [71,73,75,77,85,86];
  if (SNOW_CODES.includes(code)) return "snowy";
  if (RAIN_CODES.includes(code)) return "rainy";
  if (avg < 8)  return "cold";
  if (avg < 15) return "cool";
  if (avg < 22) return "mild";
  if (avg < 28) return "warm";
  return "hot";
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return {
    dayName: DAYS[d.getDay()],
    dateStr: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
    isToday: iso === new Date().toISOString().slice(0, 10),
  };
};

const tagClass = (cat) => {
  if (cat === "acc")    return "wc-tag wc-tag--acc";
  if (cat === "feet")   return "wc-tag wc-tag--feet";
  if (cat === "tip")    return "wc-tag wc-tag--tip";
  if (cat === "base")   return "wc-tag wc-tag--base";
  if (cat === "mid")    return "wc-tag wc-tag--mid";
  if (cat === "outer")  return "wc-tag wc-tag--outer";
  if (cat === "bottom") return "wc-tag wc-tag--bottom";
  return "wc-tag wc-tag--base";
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const MetaPill = ({ icon, value }) => (
  <div className="wc-meta-pill">
    <span>{icon}</span>
    {value}
  </div>
);

/** Mini product card displayed inside each DayCard */
const ProductMiniCard = ({ product }) => {
  const imgSrc = product.imageUrl;
  return (
    <Link to="/catalog" className="wc-prod-card" title={product.name}>
      <div className="wc-prod-img-wrap">
        {imgSrc
          ? <img src={imgSrc} alt={product.name} className="wc-prod-img" loading="lazy" />
          : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#d1d5db" }}><ShoppingBag size={28} /></div>
        }
      </div>
      <div className="wc-prod-info">
        <p className="wc-prod-name">{product.name}</p>
        <p className="wc-prod-price">Rs. {(product.price || 0).toLocaleString()}</p>
      </div>
    </Link>
  );
};

/** One day card */
const DayCard = ({ day, index, matchedProducts }) => {
  const [open, setOpen] = useState(index === 0);
  const { dayName, dateStr, isToday } = formatDate(day.date);

  return (
    <div className={`wc-card ${isToday ? "wc-card--today" : ""}`}>
      {/* Header */}
      <button className="wc-card-header" onClick={() => setOpen(o => !o)}>
        <div>
          <p className={`wc-day-label ${isToday ? "wc-day-label--today" : ""}`}>
            {isToday ? "— Today —" : dayName}
          </p>
          <p className="wc-day-date">{dateStr}</p>
        </div>
        <div className="wc-temp-emoji">
          <div>
            <span className="wc-temp-max">{Math.round(day.maxTemp)}°</span>
            <span className="wc-temp-min">/ {Math.round(day.minTemp)}°</span>
          </div>
          <span className="wc-emoji">{day.emoji}</span>
        </div>
      </button>

      {/* Condition + meta */}
      <div className="wc-card-meta">
        <p className="wc-condition">{day.condition}</p>
        <div className="wc-meta-pills">
          <MetaPill icon="💨" value={`${Math.round(day.wind)} km/h`} />
          {day.precipitation > 0 && (
            <MetaPill icon="💧" value={`${day.precipitation.toFixed(1)} mm`} />
          )}
        </div>
      </div>

      <hr className="wc-card-divider" />

      {/* Clothing suggestions */}
      <div
        className="wc-clothes-section"
        style={{ maxHeight: open ? "700px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="wc-clothes-inner">
          <p className="wc-clothes-label">What to wear</p>
          <div className="wc-clothes-tags">
            {day.clothes.map((c, i) => (
              <span key={i} className={tagClass(c.category)}>
                <span>{c.icon}</span>
                {c.item}
              </span>
            ))}
          </div>
        </div>

        {/* DB Products matched to this day's weather */}
        {matchedProducts.length > 0 && (
          <div className="wc-products-section">
            <p className="wc-products-label">Shop for this weather</p>
            <div className="wc-products-scroll">
              {matchedProducts.map(prod => (
                <ProductMiniCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toggle hint */}
      <div className="wc-toggle-hint">
        <button className="wc-toggle-btn" onClick={() => setOpen(o => !o)}>
          {open ? "Hide outfit ↑" : "Show outfit ↓"}
        </button>
      </div>
    </div>
  );
};

// ── States ──────────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="wc-state">
    <span className="wc-state-emoji">🌍</span>
    <p className="wc-state-msg">
      Search a city above to get your personalised 7-day outfit forecast and product suggestions.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="wc-state">
    <div className="wc-spinner" />
    <p className="wc-state-msg">Fetching your forecast…</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="wc-state">
    <span className="wc-state-emoji">⛅</span>
    <p className="wc-state-msg wc-state-msg--error">{message}</p>
  </div>
);

// ── Legend ──────────────────────────────────────────────────────────────────
const Legend = () => (
  <div className="wc-legend">
    {[
      { cls: "base",   label: "Base layer" },
      { cls: "mid",    label: "Mid layer"  },
      { cls: "outer",  label: "Outer"      },
      { cls: "bottom", label: "Bottoms"    },
      { cls: "feet",   label: "Footwear"   },
      { cls: "acc",    label: "Accessories"},
      { cls: "tip",    label: "Advisory"   },
    ].map(({ cls, label }) => (
      <span key={cls} className={`wc-legend-item wc-tag--${cls}`}>
        {label}
      </span>
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function WearCast() {
  const [city,    setCity]    = useState("");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Pull all products from global context (fetched in CartContext on mount)
  const { productData } = useContext(CartContext);

  const fetchForecast = useCallback(async () => {
    const q = city.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res  = await fetch(`${API_BASE}/weekly/${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [city]);

  const onKeyDown = (e) => { if (e.key === "Enter") fetchForecast(); };

  /**
   * Build a map: day.date → matched products list.
   * Match products whose DB category is in the bucket's category list.
   * Limit to 6 products per day to keep the UI tidy.
   */
  const productsByDay = useMemo(() => {
    if (!data || !productData?.length) return {};
    const map = {};
    data.forecast.forEach(day => {
      const bucket = getWeatherBucket(day.minTemp, day.maxTemp, day.code);
      const cats   = WEATHER_CATEGORY_MAP[bucket] || [];
      map[day.date] = productData
        .filter(p => cats.some(c => p.category?.toLowerCase() === c.toLowerCase()))
        .slice(0, 6);
    });
    return map;
  }, [data, productData]);

  return (
    <div className="wc-page">
      {/* ── Hero / Search ─────────────────────── */}
      <section className="wc-hero">
        <div className="wc-hero-badge">☀️ AI Weather Stylist</div>
        <h1 className="wc-hero-title">
          Wear<em>Cast</em>
        </h1>
        <p className="wc-hero-sub">Your 7-day outfit & product planner</p>

        <div className="wc-search-wrap">
          <input
            id="wearcast-city-input"
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter a city… e.g. Karachi, London"
            className="wc-search-input"
          />
          <button
            id="wearcast-forecast-btn"
            onClick={fetchForecast}
            disabled={loading}
            className="wc-search-btn"
          >
            {loading ? "Loading…" : "Get Forecast"}
          </button>
        </div>
      </section>

      {/* ── Results ───────────────────────────── */}
      <div className="wc-content">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && data && (
          <>
            {/* City label */}
            <div className="wc-city-row">
              <h2 className="wc-city-name">{data.city}</h2>
              {data.country && (
                <span className="wc-city-country">{data.country}</span>
              )}
            </div>

            {/* Tag legend */}
            <Legend />

            {/* Cards */}
            <div className="wc-grid">
              {data.forecast.map((day, i) => (
                <DayCard
                  key={day.date}
                  day={day}
                  index={i}
                  matchedProducts={productsByDay[day.date] || []}
                />
              ))}
            </div>

            <p className="wc-footer-note">
              Powered by Open-Meteo · Products sourced from our DB · Data updates every hour
            </p>
          </>
        )}

        {!loading && !error && !data && <EmptyState />}
      </div>
    </div>
  );
}