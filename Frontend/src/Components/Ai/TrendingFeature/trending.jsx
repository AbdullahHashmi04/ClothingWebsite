import { useState, useEffect, useCallback, useRef } from "react";

// ── Region config ──────────────────────────────────────────────────────────────
const REGIONS = [
  { name: "All",              emoji: "🇵🇰", color: "#9333ea" },
  { name: "Punjab",           emoji: "🏛️",  color: "#a855f7" },
  { name: "Sindh",            emoji: "🎨",  color: "#ef4444" },
  { name: "KPK",              emoji: "⛰️",  color: "#16a34a" },
  { name: "Balochistan",      emoji: "🌺",  color: "#dc2626" },
  { name: "Islamabad",        emoji: "🏙️",  color: "#3b82f6" },
  { name: "Karachi",          emoji: "🌊",  color: "#06b6d4" },
  { name: "Gilgit-Baltistan", emoji: "🏔️",  color: "#64748b" },
  { name: "Multan",           emoji: "🏺",  color: "#d97706" },
];

const REGION_MAP = Object.fromEntries(REGIONS.map(r => [r.name, r]));

// ── Category gradient config ───────────────────────────────────────────────────
const categoryConfig = {
  "Traditional":  { gradient: "linear-gradient(135deg,#7c3aed,#a855f7)", tag: "#7c3aed" },
  "Fusion":       { gradient: "linear-gradient(135deg,#f59e0b,#ef4444)", tag: "#f59e0b" },
  "Wedding Wear": { gradient: "linear-gradient(135deg,#9333ea,#c084fc)", tag: "#9333ea" },
  "Formal":       { gradient: "linear-gradient(135deg,#7e22ce,#9333ea)", tag: "#7e22ce" },
  "Casual":       { gradient: "linear-gradient(135deg,#c026d3,#e879f9)", tag: "#c026d3" },
  "Streetwear":   { gradient: "linear-gradient(135deg,#d946ef,#f472b6)", tag: "#d946ef" },
  "Western":      { gradient: "linear-gradient(135deg,#3b82f6,#6366f1)", tag: "#3b82f6" },
};
const defaultCfg = { gradient: "linear-gradient(135deg,#9333ea,#c084fc)", tag: "#9333ea" };
const getCfg = cat => categoryConfig[cat] || defaultCfg;

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: "20px", overflow: "hidden",
      background: "#fff", border: "1px solid #f3e8ff",
      boxShadow: "0 2px 12px rgba(147,51,234,0.06)",
    }}>
      <div style={{
        height: "240px",
        background: "linear-gradient(90deg,#f3e8ff 25%,#faf5ff 50%,#f3e8ff 75%)",
        backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
      }} />
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[["55%","14px"],["80%","20px"],["40%","13px"]].map(([w,h],i) => (
          <div key={i} style={{
            height: h, width: w, borderRadius: "8px",
            background: "linear-gradient(90deg,#f3e8ff 25%,#faf5ff 50%,#f3e8ff 75%)",
            backgroundSize: "200% 100%", animation: `shimmer 1.4s infinite ${i*0.1}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function FashionModal({ item, onClose }) {
  const cfg = getCfg(item.category);
  const regionCfg = REGION_MAP[item.region] || REGION_MAP["All"];

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10,2,24,0.75)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "28px", overflow: "hidden",
        width: "100%", maxWidth: "880px", maxHeight: "90vh",
        display: "flex", flexDirection: "row",
        boxShadow: "0 40px 120px rgba(147,51,234,0.28), 0 8px 32px rgba(0,0,0,0.2)",
        animation: "scaleIn 0.28s cubic-bezier(0.34,1.4,0.64,1)",
        overflowY: "auto",
      }}>
        {/* Left: image */}
        <div style={{
          flex: "0 0 44%", position: "relative", minHeight: "440px",
          background: cfg.gradient, flexShrink: 0,
        }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.style} style={{
              width: "100%", height: "100%", objectFit: "cover",
              position: "absolute", inset: 0, display: "block",
            }} />
          ) : (
            <div style={{
              position: "absolute", inset: 0, background: cfg.gradient,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: "12px",
            }}>
              <span style={{ fontSize: "52px" }}>{regionCfg.emoji}</span>
              <span style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, textAlign: "center", padding: "0 20px" }}>
                {item.style}
              </span>
            </div>
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)",
            pointerEvents: "none",
          }} />
          {/* Region badge on image */}
          <div style={{
            position: "absolute", top: "16px", left: "16px",
            background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: "100px",
            padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontSize: "14px" }}>{regionCfg.emoji}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
              {item.region}
            </span>
          </div>
          {/* Trending badge */}
          <div style={{
            position: "absolute", bottom: "20px", left: "20px",
            background: cfg.gradient, borderRadius: "100px", padding: "7px 16px",
            display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
              🔥 TRENDING
            </span>
          </div>
        </div>

        {/* Right: details */}
        <div style={{
          flex: 1, padding: "36px 32px", display: "flex", flexDirection: "column",
          gap: "18px", position: "relative", overflowY: "auto",
        }}>
          {/* Close */}
          <button onClick={onClose} aria-label="Close" style={{
            position: "absolute", top: "18px", right: "18px",
            width: "36px", height: "36px", borderRadius: "50%",
            border: "1.5px solid #e9d5ff", background: "#faf5ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = cfg.gradient; e.currentTarget.style.borderColor = "transparent"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#faf5ff"; e.currentTarget.style.borderColor = "#e9d5ff"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.tag} strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Pills row */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Category pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: `${cfg.tag}15`, border: `1px solid ${cfg.tag}30`,
              borderRadius: "100px", padding: "5px 14px",
            }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: cfg.gradient }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 700, color: cfg.tag, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {item.category}
              </span>
            </div>
            {/* Region pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: `${regionCfg.color}12`, border: `1px solid ${regionCfg.color}30`,
              borderRadius: "100px", padding: "5px 14px",
            }}>
              <span style={{ fontSize: "12px" }}>{regionCfg.emoji}</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 700, color: regionCfg.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {item.region}
              </span>
            </div>
          </div>

          {/* Style name */}
          <h2 style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 900,
            color: "#1a0a2e", margin: 0, lineHeight: 1.25, letterSpacing: "-0.01em",
          }}>{item.style}</h2>

          {/* Description */}
          {item.description && (
            <p style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "14.5px", color: "#4b5563",
              margin: 0, lineHeight: 1.8,
              borderLeft: `3px solid ${cfg.tag}`,
              paddingLeft: "14px",
            }}>{item.description}</p>
          )}

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "📍 Popular In", value: item.popular_in || "—" },
              { label: "✨ Category",   value: item.category },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: `${cfg.tag}0d`, borderRadius: "14px",
                padding: "14px 16px", border: `1px solid ${cfg.tag}20`,
              }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", fontWeight: 700, color: cfg.tag, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
                  {label}
                </div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", fontWeight: 600, color: "#1a0a2e" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: "#f3e8ff" }} />

          <button onClick={onClose} style={{
            background: cfg.gradient, color: "#fff", border: "none",
            borderRadius: "14px", padding: "14px 28px",
            fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 700,
            letterSpacing: "0.03em", cursor: "pointer",
            boxShadow: `0 8px 24px ${cfg.tag}40`,
            transition: "transform 0.2s, box-shadow 0.2s", marginTop: "auto",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 14px 32px ${cfg.tag}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.tag}40`; }}>
            Close details ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fashion card ───────────────────────────────────────────────────────────────
function FashionCard({ item, index, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cfg = getCfg(item.category);
  const regionCfg = REGION_MAP[item.region] || REGION_MAP["All"];

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "20px", overflow: "hidden",
        background: "#fff",
        border: hovered ? "1.5px solid #c084fc" : "1.5px solid #f3e8ff",
        boxShadow: hovered
          ? "0 20px 50px rgba(147,51,234,0.18), 0 4px 16px rgba(147,51,234,0.1)"
          : "0 2px 14px rgba(147,51,234,0.07)",
        transform: hovered ? "translateY(-7px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.34,1.4,0.64,1)",
        cursor: "pointer",
        animation: "fadeUp 0.5s ease both",
        animationDelay: `${index * 60}ms`,
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image area */}
      <div style={{ position: "relative", height: "240px", overflow: "hidden", flexShrink: 0 }}>
        {item.image_url && !imgError ? (
          <img
            src={item.image_url} alt={item.style}
            onError={() => setImgError(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.55s ease",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%", background: cfg.gradient,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "10px",
          }}>
            <span style={{ fontSize: "44px" }}>{regionCfg.emoji}</span>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, textAlign: "center", padding: "0 16px" }}>
              {item.style}
            </span>
          </div>
        )}

        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(255,255,255,0.4) 0%, transparent 55%)",
          pointerEvents: "none",
        }} />

        {/* Top-left: region badge */}
        <div style={{
          position: "absolute", top: "11px", left: "11px",
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
          border: `1px solid ${regionCfg.color}30`, borderRadius: "100px",
          padding: "4px 11px", display: "flex", alignItems: "center", gap: "5px",
        }}>
          <span style={{ fontSize: "11px" }}>{regionCfg.emoji}</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10.5px", fontWeight: 700, color: regionCfg.color, letterSpacing: "0.04em" }}>
            {item.region}
          </span>
        </div>

        {/* Top-right: category pill */}
        <div style={{
          position: "absolute", top: "11px", right: "11px",
          background: cfg.gradient, borderRadius: "100px", padding: "4px 11px",
        }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
            {item.category}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: "9px", flex: 1 }}>
        <h3 style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: "16.5px", fontWeight: 700, color: "#1a0a2e",
          margin: 0, lineHeight: 1.3,
        }}>{item.style}</h3>

        {item.description && (
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "12px", color: "#6b7280",
            margin: 0, lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{item.description}</p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={cfg.tag} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#6b7280" }}>
            <span style={{ color: cfg.tag, fontWeight: 600 }}>{item.popular_in}</span>
          </span>
        </div>

        <div style={{ height: "1px", background: "#f3e8ff", margin: "2px 0" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#9ca3af", letterSpacing: "0.04em" }}>
            Explore Style
          </span>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: hovered ? cfg.gradient : "#faf5ff",
            border: `1.5px solid ${hovered ? "transparent" : "#e9d5ff"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease", flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={hovered ? "#fff" : cfg.tag}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "stroke 0.3s, transform 0.3s", transform: hovered ? "rotate(45deg)" : "none" }}>
              <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Region tab ─────────────────────────────────────────────────────────────────
function RegionTab({ region, active, onClick }) {
  const [hov, setHov] = useState(false);
  const isActive = active === region.name;
  return (
    <button
      onClick={() => onClick(region.name)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "9px 18px", borderRadius: "100px", border: "none",
        background: isActive
          ? `linear-gradient(135deg, ${region.color}, ${region.color}bb)`
          : (hov ? "#f5f3ff" : "#faf5ff"),
        color: isActive ? "#fff" : (hov ? region.color : "#6b7280"),
        fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: isActive ? 700 : 500,
        cursor: "pointer", letterSpacing: "0.02em", whiteSpace: "nowrap",
        boxShadow: isActive ? `0 6px 18px ${region.color}45` : "none",
        transition: "all 0.25s ease",
        outline: "none",
      }}>
      <span style={{ fontSize: "14px" }}>{region.emoji}</span>
      {region.name}
    </button>
  );
}

// ── Error state ────────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 24px", gap: "16px", textAlign: "center",
    }}>
      <div style={{ fontSize: "48px" }}>😔</div>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: "#1a0a2e", margin: 0 }}>
        Couldn't load trends
      </h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "#6b7280", maxWidth: "360px", margin: 0 }}>
        {message || "Something went wrong. Please try again."}
      </p>
      <button onClick={onRetry} style={{
        marginTop: "8px", padding: "12px 28px", borderRadius: "100px",
        background: "linear-gradient(135deg,#9333ea,#ec4899)", border: "none",
        color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
        fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(147,51,234,0.35)",
        transition: "transform 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}>
        Try Again
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function TrendingPage() {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeRegion, setActiveRegion] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const controllerRef = useRef(null);

  const fetchTrends = useCallback(async (region) => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setItems([]);
    try {
      const url = `http://localhost:3000/trending${region !== "All" ? `?region=${encodeURIComponent(region)}` : ""}`;
      const resp = await fetch(url, { signal: controllerRef.current.signal });
      if (!resp.ok) throw new Error(`Server error (${resp.status})`);
      const data = await resp.json();
      setItems(data);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends(activeRegion);
    return () => controllerRef.current?.abort();
  }, [activeRegion, fetchTrends]);

  const handleRegion = (name) => {
    if (name === activeRegion) return;
    setActiveRegion(name);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fefcff", fontFamily: "'DM Sans',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.88) } to { opacity:1; transform:scale(1) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; background: #fafafa; }
        ::-webkit-scrollbar-thumb { background: #e9d5ff; border-radius: 4px; }
      `}</style>

      {/* ── Hero header ── */}
      <div style={{
        background: "linear-gradient(160deg,#0d0014 0%,#1a003a 50%,#0a0024 100%)",
        padding: "80px 24px 48px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        {[
          { top:"-80px", left:"5%",  size:"380px", color:"rgba(147,51,234,0.18)" },
          { top:"-40px", right:"8%", size:"320px", color:"rgba(236,72,153,0.12)" },
          { bottom:"-60px", left:"40%", size:"260px", color:"rgba(192,132,252,0.1)" },
        ].map((b, i) => (
          <div key={i} style={{
            position:"absolute", top: b.top, bottom: b.bottom,
            left: b.left, right: b.right,
            width: b.size, height: b.size, borderRadius:"50%",
            background: `radial-gradient(circle,${b.color},transparent 70%)`,
            pointerEvents:"none",
          }} />
        ))}

        {/* "Trending Now" pill */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:"8px",
          background:"rgba(255,255,255,0.07)", backdropFilter:"blur(12px)",
          border:"1px solid rgba(192,132,252,0.3)", borderRadius:"100px",
          padding:"7px 18px", marginBottom:"20px",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <span style={{ fontSize:"11px", fontWeight:700, color:"#c084fc", letterSpacing:"0.1em", textTransform:"uppercase" }}>
            Cultural Fashion Spotlight
          </span>
        </div>

        <h1 style={{
          fontFamily:"'Playfair Display',Georgia,serif",
          fontSize:"clamp(30px,5.5vw,58px)", fontWeight:900,
          color:"#fff", margin:"0 0 14px", lineHeight:1.12, letterSpacing:"-0.02em",
        }}>
          What Pakistan is{" "}
          <span style={{
            fontStyle:"italic",
            background:"linear-gradient(135deg,#c084fc 0%,#ec4899 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>wearing</span>
        </h1>

        <p style={{
          fontSize:"15px", color:"rgba(255,255,255,0.6)",
          maxWidth:"480px", margin:"0 auto 36px", lineHeight:1.75, fontWeight:300,
        }}>
          Live fashion culture across Pakistan's 8 distinct regions — from Lahore's phulkari to GB's felt coats
        </p>

        {/* Stats strip */}
        <div style={{
          display:"flex", justifyContent:"center", gap:"0", flexWrap:"wrap",
          maxWidth:"600px", margin:"0 auto",
        }}>
          {[
            { num:"8", label:"Regions" },
            { num:"24+", label:"Styles" },
            { num:"100%", label:"Pakistani" },
          ].map(({ num, label }, i) => (
            <div key={i} style={{
              flex:"1 1 120px", padding:"16px 20px",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}>
              <div style={{
                fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:900,
                background:"linear-gradient(135deg,#c084fc,#ec4899)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>{num}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.45)", letterSpacing:"0.06em", textTransform:"uppercase", marginTop:"2px" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Region filter tabs ── */}
      <div style={{
        position: "sticky", top: "0", zIndex: 100,
        background: "rgba(254,252,255,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #f3e8ff",
        padding: "14px 24px",
        overflowX: "auto",
      }}>
        <div style={{ display:"flex", gap:"8px", maxWidth:"1400px", margin:"0 auto", width:"max-content" }}>
          {REGIONS.map(r => (
            <RegionTab key={r.name} region={r} active={activeRegion} onClick={handleRegion} />
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && !error && items.length > 0 && (
        <p style={{
          textAlign:"center", marginTop:"24px", marginBottom:"0",
          fontSize:"12px", color:"#c4b5d4", letterSpacing:"0.06em", textTransform:"uppercase",
          fontFamily:"'DM Sans',sans-serif",
        }}>
          {items.length} trend{items.length !== 1 ? "s" : ""} in{" "}
          <span style={{ color:"#9333ea", fontWeight:700 }}>{activeRegion}</span>
        </p>
      )}

      {/* ── Grid area ── */}
      <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"24px 24px 80px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"20px", padding:"48px 0 24px" }}>
            <div style={{
              width:"48px", height:"48px", borderRadius:"50%",
              border:"4px solid transparent",
              borderTopColor:"#a855f7", borderRightColor:"#ec4899",
              animation:"spin 0.85s linear infinite",
              boxShadow:"0 0 16px rgba(168,85,247,0.4)",
            }} />
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"#9ca3af", letterSpacing:"0.08em" }}>
              Loading {activeRegion === "All" ? "all regions" : activeRegion} trends…
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:"22px", width:"100%" }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorState message={error} onRetry={() => fetchTrends(activeRegion)} />
        )}

        {/* Cards */}
        {!loading && !error && items.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))", gap:"22px" }}>
            {items.map((item, i) => (
              <FashionCard
                key={`${item.region}-${item.style}-${i}`}
                item={item}
                index={i}
                onOpen={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 24px" }}>
            <span style={{ fontSize:"48px" }}>🧵</span>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px", color:"#9ca3af", marginTop:"16px" }}>
              No styles found for this region yet.
            </p>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <FashionModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}