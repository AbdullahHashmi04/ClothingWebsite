import { useState, useCallback } from "react";

// ── Google Fonts injected once ────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel  = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=Outfit:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = `
  body { font-family: 'Outfit', sans-serif; background: #faf9f7; }
  .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .animate-fade-up { animation: fadeUp 0.5s ease both; }
  .card-delay-1 { animation-delay: 0.05s; }
  .card-delay-2 { animation-delay: 0.10s; }
  .card-delay-3 { animation-delay: 0.15s; }
  .card-delay-4 { animation-delay: 0.20s; }
  .card-delay-5 { animation-delay: 0.25s; }
  .card-delay-6 { animation-delay: 0.30s; }
  .card-delay-7 { animation-delay: 0.35s; }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #e5e1d8;
    border-top-color: #c8a96e;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  .tag-hover:hover { border-color: #c8a96e !important; }
  input:focus { outline: none; box-shadow: 0 0 0 3px rgba(200,169,110,0.18); }
`;
document.head.appendChild(style);

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:3000/api/weather";
const DAYS     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return {
    dayName: DAYS[d.getDay()],
    dateStr: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
    isToday: iso === new Date().toISOString().slice(0, 10),
  };
};

const categoryStyle = (cat) => {
  if (cat === "acc")  return "bg-sky-50 border-sky-200 text-sky-700";
  if (cat === "feet") return "bg-amber-50 border-amber-200 text-amber-800";
  if (cat === "tip")  return "bg-red-50 border-red-200 text-red-600";
  if (cat === "base") return "bg-stone-100 border-stone-200 text-stone-700";
  if (cat === "mid")  return "bg-orange-50 border-orange-200 text-orange-700";
  if (cat === "outer")return "bg-indigo-50 border-indigo-200 text-indigo-700";
  return "bg-stone-50 border-stone-200 text-stone-600";
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ClothingTag = ({ item, category, icon }) => (
  <span
    className={`tag-hover inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${categoryStyle(category)}`}
  >
    <span>{icon}</span>
    {item}
  </span>
);

const MetaPill = ({ icon, value }) => (
  <div className="flex items-center gap-1.5 text-xs text-stone-400 font-light">
    <span className="text-sm">{icon}</span>
    {value}
  </div>
);

const DayCard = ({ day, index }) => {
  const [open, setOpen] = useState(index === 0);
  const { dayName, dateStr, isToday } = formatDate(day.date);

  return (
    <div
      className={`animate-fade-up card-delay-${index + 1} rounded-2xl border transition-all duration-300 overflow-hidden
        ${isToday
          ? "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-md shadow-amber-100"
          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
        }`}
    >
      {/* Card header — always visible, click to toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 pt-5 pb-4 flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className="min-w-0">
            <p className={`text-xs tracking-widest uppercase font-medium mb-0.5 ${isToday ? "text-amber-600" : "text-stone-400"}`}>
              {isToday ? "— Today —" : dayName}
            </p>
            <p className="font-display text-2xl font-semibold text-stone-800 leading-none">
              {dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Temp range */}
          <div className="text-right">
            <span className="font-display text-2xl font-bold text-amber-600">
              {Math.round(day.maxTemp)}°
            </span>
            <span className="text-stone-400 text-sm ml-1">
              / {Math.round(day.minTemp)}°
            </span>
          </div>
          {/* Emoji */}
          <span className="text-3xl leading-none">{day.emoji}</span>
        </div>
      </button>

      {/* Condition + meta row */}
      <div className="px-5 pb-3 flex items-center justify-between">
        <p className="text-sm text-stone-500 font-light">{day.condition}</p>
        <div className="flex gap-4">
          <MetaPill icon="💨" value={`${Math.round(day.wind)} km/h`} />
          {day.precipitation > 0 && (
            <MetaPill icon="💧" value={`${day.precipitation.toFixed(1)} mm`} />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-stone-100" />

      {/* Clothing section — collapsible */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "400px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pt-4 pb-5">
          <p className="text-xs tracking-widest uppercase text-stone-400 font-medium mb-3">
            What to wear
          </p>
          <div className="flex flex-wrap gap-2">
            {day.clothes.map((c, i) => (
              <ClothingTag key={i} {...c} />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle hint */}
      <div className="px-5 pb-3 flex justify-center">
        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs text-stone-400 hover:text-amber-600 transition-colors duration-200 flex items-center gap-1"
        >
          {open ? "Hide outfit ↑" : "Show outfit ↓"}
        </button>
      </div>
    </div>
  );
};

// ── Empty / loading / error states ────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-28 gap-4 text-center animate-fade-up">
    <span className="text-6xl">🌍</span>
    <p className="text-stone-400 font-light text-sm max-w-xs leading-relaxed">
      Search a city above to get your personalised 7-day outfit forecast
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-28 gap-5 animate-fade-up">
    <div className="spinner" />
    <p className="text-stone-400 font-light text-sm">Fetching your forecast…</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-28 gap-4 animate-fade-up">
    <span className="text-5xl">⛅</span>
    <p className="text-red-400 text-sm font-light max-w-xs text-center leading-relaxed">{message}</p>
  </div>
);

// ── Legend ────────────────────────────────────────────────────────────────────
const Legend = () => (
  <div className="flex flex-wrap gap-3 mb-8 animate-fade-up">
    {[
      { cat: "base",  label: "Base layer" },
      { cat: "mid",   label: "Mid layer"  },
      { cat: "outer", label: "Outer"      },
      { cat: "feet",  label: "Footwear"   },
      { cat: "acc",   label: "Accessories"},
      { cat: "tip",   label: "Advisory"   },
    ].map(({ cat, label }) => (
      <span key={cat} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${categoryStyle(cat)}`}>
        {label}
      </span>
    ))}
  </div>
);

// ── Main app ──────────────────────────────────────────────────────────────────
export default function WearCast() {
  const [city,    setCity]    = useState("");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

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

  return (
    <div
      className="bg-stone-50 flex flex-col items-center min-h-screen"
      style={{
        fontFamily: "'Outfit', sans-serif",
        marginTop: "80px",
        minHeight: "calc(100vh - 80px)",
      }}
    >
      {/* Amber accent stripe just below navbar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400" />

      <div className="max-w-5xl mx-auto px-5 pb-24">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="pt-8 pb-8">
          <div className="flex items-end gap-3 mb-1">
            <h1 className="font-display text-6xl font-bold text-stone-800 leading-none tracking-tight">
              Wear
              <span className="italic font-medium text-amber-500">Cast</span>
            </h1>
            <span className="text-4xl mb-1">☀️</span>
          </div>
          <p className="text-stone-400 text-xs tracking-[0.2em] uppercase font-light mt-2">
            Your weekly outfit planner
          </p>
        </header>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-12 max-w-lg">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter a city… e.g. Tokyo, Paris"
            className="flex-1 bg-white border border-stone-200 rounded-xl px-5 py-3.5 text-sm text-stone-700 placeholder-stone-300 font-light transition-all duration-200"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          />
          <button
            onClick={fetchForecast}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shadow-sm shadow-amber-200"
          >
            {loading ? "Loading…" : "Get Forecast"}
          </button>
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && !error && data && (
          <>
            {/* City label */}
            <div className="flex items-baseline gap-3 mb-6 animate-fade-up">
              <h2 className="font-display text-4xl font-bold text-stone-800">{data.city}</h2>
              {data.country && (
                <span className="text-xs text-stone-400 tracking-widest uppercase">{data.country}</span>
              )}
            </div>

            {/* Tag legend */}
            <Legend />

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.forecast.map((day, i) => (
                <DayCard key={day.date} day={day} index={i} />
              ))}
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-stone-300 font-light mt-10">
              Powered by Open-Meteo · Data updates every hour
            </p>
          </>
        )}

        {!loading && !error && !data && <EmptyState />}
      </div>
    </div>
  );
}