import React, { useContext, useEffect, useState, useRef } from 'react';
import CartContext from '../../Context/CartContext';
import axios from 'axios';

const BACKEND_URI = (
  import.meta.env.VITE_BACKEND_URI ||
  import.meta.env.VITE_BACKEND_URL ||
  ''
).replace(/\/+$/, '');

export default function Vto() {
  const [humanPreview, setHumanPreview] = useState(null);
  const [humanFile, setHumanFile] = useState(null);
  const { ImageVto, addVtoImage, catalogData } = useContext(CartContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('upper_body');
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedGarmentId, setSelectedGarmentId] = useState(null);

  // Sync selected garment id from context
  useEffect(() => {
    if (ImageVto && ImageVto.length > 0 && ImageVto[0]?._id) {
      setSelectedGarmentId(ImageVto[0]._id);
    }
  }, [ImageVto]);

  // Simulated progress bar during loading
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) { clearInterval(interval); return 90; }
          return prev + Math.random() * 8;
        });
      }, 1500);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setHumanPreview(imageUrl);
      setHumanFile(file);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Helper to extract image from product
  const getProductImage = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) return product.images[0];
    return product?.imageUrl || product?.img || product?.image || product?.thumbnail || '';
  };

  // Select a product from the shelf as the garment
  const handleSelectGarment = (product) => {
    const img = getProductImage(product);
    addVtoImage({
      ...product,
      name: product.title || product.name,
      img,
    });
    setSelectedGarmentId(product._id || product.id);
  };

  const handleTryOn = async () => {
    if (!humanFile) {
      setError('Please upload your photo first.');
      return;
    }
    if (!ImageVto || ImageVto.length === 0 || !ImageVto[0]?.img) {
      setError('No garment selected. Please select a product from the shelf below.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const clothImageUrl = ImageVto[0].img;
      const clothResponse = await fetch(clothImageUrl);
      const clothBlob = await clothResponse.blob();
      const clothFile = new File([clothBlob], 'cloth.jpg', {
        type: clothBlob.type || 'image/jpeg',
      });

      const formData = new FormData();
      formData.append('person', humanFile);
      formData.append('cloth', clothFile);
      formData.append('category', category);
      formData.append('garment_des', ImageVto[0]?.name || 'clothing item');

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await axios.post(
        `${BACKEND_URI}/viton`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data', ...headers },
          timeout: 300000,
        }
      );

      if (response.data.success && response.data.result_url) {
        setResult(response.data.result_url);
      } else {
        throw new Error(response.data.message || 'Virtual try-on failed.');
      }
    } catch (err) {
      console.error('Try-on error:', err);
      let errorMsg = 'Virtual try-on failed. Please try again.';
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      else if (err.message) errorMsg = err.message;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = 'virtual-tryon-result.png';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearResult = () => { setResult(null); setError(null); };

  const clearPerson = () => {
    setHumanPreview(null);
    setHumanFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const categories = [
    { value: 'upper_body', label: 'Upper Body', icon: '👔' },
    { value: 'lower_body', label: 'Lower Body', icon: '👖' },
    { value: 'dresses', label: 'Dresses', icon: '👗' },
  ];

  // Filter catalog for shelf — show up to 10 items
  const shelfProducts = catalogData ? catalogData.slice(0, 10) : [];

  return (
    <div style={s.page}>
      {/* ── Decorative background blobs ── */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />

      <div style={s.container}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div style={s.badge}>
            <span style={s.badgeDot}>✦</span>
            <span style={s.badgeText}>AI-Powered Experience</span>
          </div>
          <h1 style={s.title}>
            Virtual <span style={s.titleGrad}>Try-On</span>
          </h1>
          <p style={s.subtitle}>
            See yourself in any outfit before you buy — powered by IDM‑VTON AI
          </p>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div style={s.tabRow}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              style={{
                ...s.tab,
                ...(category === cat.value ? s.tabActive : {}),
              }}
            >
              <span style={s.tabIcon}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── PROGRESS BAR ── */}
        {loading && (
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${progress}%` }} />
          </div>
        )}

        {/* ── THREE CARDS ── */}
        <div style={s.grid}>

          {/* Card 1 – Your Photo */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.stepNum}>1</span>
              <span style={s.cardLabel}>Your Photo</span>
              {humanPreview && (
                <button onClick={clearPerson} style={s.iconBtn} title="Remove">✕</button>
              )}
            </div>
            <div
              style={{
                ...s.dropZone,
                ...(dragActive ? s.dropActive : {}),
                ...(humanPreview ? s.dropFilled : {}),
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {humanPreview ? (
                <img src={humanPreview} alt="Your Photo" style={s.previewImg} />
              ) : (
                <div style={s.emptyBody}>
                  <div style={s.uploadIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p style={s.emptyTitle}>{dragActive ? 'Drop here!' : 'Upload your photo'}</p>
                  <p style={s.emptyHint}>Drag & drop or click to browse</p>
                  <p style={s.emptyTip}>💡 Front‑facing, well‑lit photo works best</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2 – Selected Garment */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.stepNum}>2</span>
              <span style={s.cardLabel}>Selected Garment</span>
              {ImageVto && ImageVto.length > 0 && (
                <span style={s.garmentBadge}>Selected</span>
              )}
            </div>
            <div style={{
              ...s.dropZone,
              ...(ImageVto && ImageVto.length > 0 ? s.dropFilled : {}),
              cursor: 'default',
            }}>
              {ImageVto && ImageVto.length > 0 ? (
                <div style={s.garmentPreview}>
                  <img
                    src={ImageVto[0].img || ImageVto[0].imageUrl || ImageVto[0].image}
                    alt={ImageVto[0].name || 'Selected Garment'}
                    style={s.previewImg}
                  />
                  {ImageVto[0].name && (
                    <div style={s.garmentTag}>{ImageVto[0].name}</div>
                  )}
                </div>
              ) : (
                <div style={s.emptyBody}>
                  <div style={s.emptyClothIcon}>👕</div>
                  <p style={s.emptyTitle}>No garment selected</p>
                  <p style={s.emptyHint}>Pick a product from the shelf below</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3 – Result */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.stepNum}>3</span>
              <span style={s.cardLabel}>Result</span>
              {result && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={handleDownload} style={s.iconBtn} title="Download">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button onClick={clearResult} style={s.iconBtn} title="Clear">✕</button>
                </div>
              )}
            </div>
            <div style={{
              ...s.dropZone,
              ...(result ? s.dropFilled : {}),
              cursor: 'default',
            }}>
              {loading ? (
                <div style={s.emptyBody}>
                  <div style={s.spinner} />
                  <p style={s.emptyTitle}>AI is working its magic…</p>
                  <p style={s.emptyHint}>Usually takes 20 – 45 seconds</p>
                  <div style={s.dotRow}>
                    <span style={{ ...s.dot, animationDelay: '0s' }}>●</span>
                    <span style={{ ...s.dot, animationDelay: '0.3s' }}>●</span>
                    <span style={{ ...s.dot, animationDelay: '0.6s' }}>●</span>
                  </div>
                </div>
              ) : result ? (
                <img src={result} alt="VTO Result" style={s.previewImg} />
              ) : (
                <div style={s.emptyBody}>
                  <div style={{ ...s.emptyClothIcon, fontSize: '42px' }}>✨</div>
                  <p style={s.emptyTitle}>Your result appears here</p>
                  <p style={s.emptyHint}>Upload a photo & select a garment, then hit Try It On</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TRY ON BUTTON ── */}
        <div style={s.btnRow}>
          <button
            onClick={handleTryOn}
            disabled={loading}
            style={{ ...s.tryBtn, ...(loading ? s.tryBtnDisabled : {}) }}
          >
            {loading ? (
              <>
                <span style={s.btnSpinner} />
                Processing…
              </>
            ) : (
              <>
                <span style={{ fontSize: '20px' }}>🪄</span>
                Try It On
              </>
            )}
          </button>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={s.errorBox}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={s.errorClose}>✕</button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
              PRODUCT SHELF — pick a garment
        ═══════════════════════════════════════════════ */}
        <div style={s.shelfSection}>
          <div style={s.shelfHeader}>
            <div>
              <h2 style={s.shelfTitle}>Choose a Garment</h2>
              <p style={s.shelfSubtitle}>Select any product to try it on virtually</p>
            </div>
            <div style={s.shelfBadge}>
              {shelfProducts.length} items
            </div>
          </div>

          {shelfProducts.length === 0 ? (
            <div style={s.shelfEmpty}>
              <span style={{ fontSize: '40px' }}>🧥</span>
              <p>No products available yet</p>
            </div>
          ) : (
            <div style={s.shelf}>
              {shelfProducts.map((product, idx) => {
                const img = getProductImage(product);
                const isSelected = selectedGarmentId && (selectedGarmentId === (product._id || product.id));
                const isHovered = hoveredProduct === (product._id || product.id || idx);
                return (
                  <div
                    key={product._id || product.id || idx}
                    style={{
                      ...s.shelfCard,
                      ...(isSelected ? s.shelfCardSelected : {}),
                      ...(isHovered && !isSelected ? s.shelfCardHover : {}),
                    }}
                    onClick={() => handleSelectGarment(product)}
                    onMouseEnter={() => setHoveredProduct(product._id || product.id || idx)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div style={s.shelfImgWrap}>
                      <img
                        src={img}
                        alt={product.name || product.title}
                        style={s.shelfImg}
                        loading="lazy"
                      />
                      {isSelected && (
                        <div style={s.selectedOverlay}>
                          <span style={s.selectedCheck}>✓</span>
                        </div>
                      )}
                      {!isSelected && isHovered && (
                        <div style={s.hoverOverlay}>
                          <span style={s.hoverLabel}>Select</span>
                        </div>
                      )}
                    </div>
                    <div style={s.shelfInfo}>
                      <p style={{
                        ...s.shelfName,
                        ...(isSelected ? { color: '#7c3aed' } : {}),
                      }}>
                        {(product.name || product.title || 'Product').slice(0, 22)}
                        {(product.name || product.title || '').length > 22 ? '…' : ''}
                      </p>
                      {product.price && (
                        <p style={s.shelfPrice}>Rs. {product.price.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── TIPS ── */}
        <div style={s.tipsCard}>
          <h4 style={s.tipsTitle}>
            <span>📌</span> Tips for Best Results
          </h4>
          <div style={s.tipsGrid}>
            {[
              { icon: '📸', label: 'Good Lighting', desc: 'Clear, well-lit environment' },
              { icon: '🧍', label: 'Front Facing', desc: 'Stand straight facing camera' },
              { icon: '👕', label: 'Fitted Clothing', desc: 'Wear fitted clothes for accuracy' },
              { icon: '📐', label: 'Full Body Visible', desc: 'Upper body must be fully seen' },
            ].map(tip => (
              <div key={tip.label} style={s.tipItem}>
                <div style={s.tipIcon}>{tip.icon}</div>
                <div>
                  <p style={s.tipLabel}>{tip.label}</p>
                  <p style={s.tipDesc}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');

        @keyframes vto-spin   { to { transform: rotate(360deg); } }
        @keyframes vto-dot    { 0%,100%{opacity:.25;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes vto-shimmer{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes vto-blob1  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.06)} }
        @keyframes vto-blob2  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(.94)} }
        @keyframes vto-blob3  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
        @keyframes vto-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .vto-try-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(124,58,237,.45) !important;
        }
        .vto-try-btn:active:not(:disabled) { transform: translateY(0); }
        .vto-tab:hover { border-color: rgba(124,58,237,.4) !important; color: #7c3aed !important; }
        .vto-icon-btn:hover { background: rgba(124,58,237,.1) !important; color: #7c3aed !important; }
        .vto-shelf-card { transition: transform .28s cubic-bezier(.4,0,.2,1), box-shadow .28s; }
        .vto-shelf-card:hover { transform: translateY(-5px); }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STYLES — matching Catalog's light purple/pink palette
───────────────────────────────────────────────────────── */
const PURPLE   = '#7c3aed';
const PURPLE_L = '#9333ea';
const PINK     = '#ec4899';
const GRAD     = `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 100%)`;
const GRAD_SOFT= 'linear-gradient(135deg,#ede9fe 0%,#fce7f3 100%)';
const TEXT     = '#111827';
const MUTED    = '#6b7280';
const BORDER   = 'rgba(229,231,235,.9)';
const WHITE    = '#ffffff';
const FONT     = "'Inter', system-ui, -apple-system, sans-serif";

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg,#f5f3ff 0%,#fff 45%,#fdf2f8 100%)',
    padding: '40px 0 80px',
    fontFamily: FONT,
    overflow: 'hidden',
    position: 'relative',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    position: 'relative',
    zIndex: 1,
  },

  // Blobs
  blob1: {
    position: 'absolute', top: '-8%', left: '-6%',
    width: '420px', height: '420px', borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)',
    animation: 'vto-blob1 22s ease-in-out infinite', pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', top: '45%', right: '-8%',
    width: '480px', height: '480px', borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(236,72,153,.1) 0%,transparent 70%)',
    animation: 'vto-blob2 26s ease-in-out infinite', pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute', bottom: '5%', left: '32%',
    width: '320px', height: '320px', borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(124,58,237,.07) 0%,transparent 70%)',
    animation: 'vto-blob3 19s ease-in-out infinite', pointerEvents: 'none',
  },

  // Header
  header: {
    textAlign: 'center',
    padding: '3rem 1rem 2.2rem',
    animation: 'vto-fadeUp .6s ease-out',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: GRAD_SOFT, color: PURPLE,
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '.08em',
    textTransform: 'uppercase', padding: '6px 18px',
    borderRadius: '50px', border: `1px solid rgba(124,58,237,.2)`,
    marginBottom: '18px',
  },
  badgeDot: { fontSize: '10px' },
  badgeText: { fontSize: '12px' },
  title: {
    fontFamily: "'Playfair Display',Georgia,serif",
    fontSize: 'clamp(2rem,5.5vw,3.2rem)',
    fontWeight: 900, color: TEXT,
    lineHeight: 1.12, letterSpacing: '-0.03em',
    margin: '0 0 12px',
  },
  titleGrad: {
    background: GRAD,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 'clamp(.9rem,1.5vw,1.05rem)',
    color: MUTED, maxWidth: '520px', margin: '0 auto',
    lineHeight: 1.6,
  },

  // Category tabs
  tabRow: {
    display: 'flex', justifyContent: 'center', gap: '10px',
    marginBottom: '28px', flexWrap: 'wrap',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '9px 20px', borderRadius: '50px',
    border: `2px solid ${BORDER}`, background: WHITE,
    color: MUTED, fontSize: '0.875rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all .22s',
    boxShadow: '0 2px 12px rgba(0,0,0,.06)',
    fontFamily: FONT,
    className: 'vto-tab',
  },
  tabActive: {
    background: GRAD, borderColor: 'transparent',
    color: WHITE, boxShadow: '0 4px 18px rgba(124,58,237,.35)',
  },
  tabIcon: { fontSize: '17px' },

  // Progress bar
  progressTrack: {
    maxWidth: '860px', margin: '0 auto 20px',
    height: '3px', borderRadius: '10px',
    background: 'rgba(124,58,237,.08)', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: '10px',
    background: GRAD,
    backgroundSize: '200% 100%',
    animation: 'vto-shimmer 2s linear infinite',
    transition: 'width .5s ease',
  },

  // Three-column grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))',
    gap: '22px', marginBottom: '28px',
  },

  // Card
  card: {
    background: WHITE, borderRadius: '18px',
    border: `1px solid ${BORDER}`,
    boxShadow: '0 2px 12px rgba(0,0,0,.06)',
    overflow: 'hidden',
    animation: 'vto-fadeUp .55s ease-out',
  },
  cardHead: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 18px',
    borderBottom: `1px solid ${BORDER}`,
  },
  stepNum: {
    width: '27px', height: '27px', borderRadius: '8px',
    background: GRAD, color: WHITE,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 700, flexShrink: 0,
  },
  cardLabel: {
    flex: 1, fontSize: '15px', fontWeight: 700, color: TEXT,
  },
  garmentBadge: {
    fontSize: '11px', fontWeight: 700, color: PURPLE,
    background: GRAD_SOFT, border: `1px solid rgba(124,58,237,.2)`,
    borderRadius: '50px', padding: '3px 10px',
    textTransform: 'uppercase', letterSpacing: '.06em',
  },
  iconBtn: {
    width: '28px', height: '28px', borderRadius: '8px',
    border: `1px solid ${BORDER}`, background: 'transparent',
    color: MUTED, cursor: 'pointer', fontSize: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s', fontFamily: FONT,
    className: 'vto-icon-btn',
  },

  // Drop zone
  dropZone: {
    margin: '14px', minHeight: '310px', borderRadius: '14px',
    border: `2px dashed ${BORDER}`, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all .25s',
    background: 'rgba(245,243,255,.5)',
    overflow: 'hidden',
  },
  dropActive: {
    border: `2px dashed ${PURPLE_L}`,
    background: 'rgba(147,51,234,.05)',
  },
  dropFilled: {
    border: `2px solid rgba(124,58,237,.25)`,
    background: 'rgba(245,243,255,.8)',
  },

  previewImg: {
    maxWidth: '100%', maxHeight: '310px',
    objectFit: 'contain', borderRadius: '8px',
  },

  // Empty state inside drop zone
  emptyBody: { textAlign: 'center', padding: '32px 24px' },
  uploadIcon: {
    width: '58px', height: '58px', borderRadius: '16px',
    background: GRAD_SOFT, border: `1px solid rgba(124,58,237,.2)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px', color: PURPLE,
  },
  emptyClothIcon: { fontSize: '48px', marginBottom: '12px', opacity: .55 },
  emptyTitle: { fontSize: '15px', fontWeight: 700, color: TEXT, marginBottom: '6px' },
  emptyHint: { fontSize: '13px', color: MUTED, marginBottom: '10px' },
  emptyTip: {
    fontSize: '12px', color: MUTED,
    background: GRAD_SOFT, padding: '7px 14px',
    borderRadius: '8px', display: 'inline-block',
  },

  // Garment preview
  garmentPreview: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '12px', width: '100%',
  },
  garmentTag: {
    marginTop: '10px', padding: '5px 14px', borderRadius: '50px',
    background: GRAD_SOFT, border: `1px solid rgba(124,58,237,.2)`,
    color: PURPLE, fontSize: '12px', fontWeight: 600,
    maxWidth: '90%', textAlign: 'center',
    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
  },

  // Loading
  spinner: {
    width: '38px', height: '38px', margin: '0 auto 14px',
    border: '3px solid rgba(124,58,237,.15)',
    borderTopColor: PURPLE, borderRadius: '50%',
    animation: 'vto-spin .8s linear infinite',
  },
  dotRow: { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' },
  dot: {
    color: PURPLE, fontSize: '10px',
    animation: 'vto-dot 1.2s ease-in-out infinite',
  },

  // Try On button
  btnRow: { display: 'flex', justifyContent: 'center', marginBottom: '24px' },
  tryBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '15px 52px', borderRadius: '50px',
    border: 'none', background: GRAD, color: WHITE,
    fontSize: '17px', fontWeight: 700, cursor: 'pointer',
    transition: 'all .28s ease',
    boxShadow: '0 8px 28px rgba(124,58,237,.35)',
    fontFamily: FONT, letterSpacing: '.3px',
    className: 'vto-try-btn',
  },
  tryBtnDisabled: {
    background: '#d1d5db', color: '#9ca3af',
    boxShadow: 'none', cursor: 'not-allowed',
  },
  btnSpinner: {
    width: '18px', height: '18px', display: 'inline-block',
    border: '2px solid rgba(255,255,255,.3)',
    borderTopColor: WHITE, borderRadius: '50%',
    animation: 'vto-spin .6s linear infinite',
  },

  // Error
  errorBox: {
    maxWidth: '700px', margin: '0 auto 28px',
    padding: '14px 18px', borderRadius: '14px',
    background: 'rgba(239,68,68,.08)',
    border: '1px solid rgba(239,68,68,.22)',
    color: '#b91c1c', fontSize: '14px', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  errorClose: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: '#ef4444', cursor: 'pointer', fontSize: '14px', flexShrink: 0,
    fontFamily: FONT,
  },

  // ═══ PRODUCT SHELF ═══
  shelfSection: {
    marginBottom: '40px', padding: '32px',
    background: WHITE, borderRadius: '24px',
    border: `1px solid ${BORDER}`,
    boxShadow: '0 4px 20px rgba(0,0,0,.05)',
  },
  shelfHeader: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', flexWrap: 'wrap',
    gap: '12px', marginBottom: '24px',
  },
  shelfTitle: {
    fontFamily: "'Playfair Display',Georgia,serif",
    fontSize: 'clamp(1.3rem,3vw,1.7rem)',
    fontWeight: 800, color: TEXT,
    margin: '0 0 4px', letterSpacing: '-0.02em',
  },
  shelfSubtitle: { fontSize: '14px', color: MUTED, margin: 0 },
  shelfBadge: {
    fontSize: '12px', fontWeight: 700, color: PURPLE,
    background: GRAD_SOFT, border: `1px solid rgba(124,58,237,.2)`,
    borderRadius: '50px', padding: '5px 14px',
    alignSelf: 'flex-start',
  },
  shelfEmpty: {
    textAlign: 'center', padding: '40px',
    color: MUTED, fontSize: '15px',
  },
  shelf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))',
    gap: '16px',
  },

  // Shelf card
  shelfCard: {
    background: '#fafafa', borderRadius: '14px',
    border: `1px solid ${BORDER}`,
    cursor: 'pointer', overflow: 'hidden',
    transition: 'all .28s cubic-bezier(.4,0,.2,1)',
    boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    className: 'vto-shelf-card',
  },
  shelfCardHover: {
    borderColor: `rgba(124,58,237,.35)`,
    boxShadow: '0 6px 20px rgba(124,58,237,.14)',
  },
  shelfCardSelected: {
    border: `2px solid ${PURPLE}`,
    boxShadow: '0 6px 24px rgba(124,58,237,.25)',
    background: GRAD_SOFT,
  },
  shelfImgWrap: {
    position: 'relative', width: '100%', aspectRatio: '3/4',
    overflow: 'hidden',
    background: 'linear-gradient(135deg,#f3f0ff,#fce7f3)',
  },
  shelfImg: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform .4s ease',
  },
  selectedOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(124,58,237,.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  selectedCheck: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: PURPLE, color: WHITE,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: 700, boxShadow: '0 4px 12px rgba(124,58,237,.4)',
  },
  hoverOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(124,58,237,.12)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    paddingBottom: '10px',
  },
  hoverLabel: {
    fontSize: '11px', fontWeight: 700, color: WHITE,
    background: PURPLE, padding: '4px 12px',
    borderRadius: '50px', letterSpacing: '.06em',
    textTransform: 'uppercase',
  },
  shelfInfo: { padding: '10px 10px 12px' },
  shelfName: {
    fontSize: '12px', fontWeight: 600, color: TEXT,
    margin: '0 0 3px', lineHeight: 1.35,
  },
  shelfPrice: {
    fontSize: '12px', fontWeight: 700,
    color: PURPLE, margin: 0,
  },

  // Tips
  tipsCard: {
    padding: '28px 30px', borderRadius: '20px',
    background: WHITE, border: `1px solid ${BORDER}`,
    boxShadow: '0 2px 12px rgba(0,0,0,.05)',
  },
  tipsTitle: {
    fontSize: '17px', fontWeight: 700, color: TEXT,
    marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
    gap: '14px',
  },
  tipItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '14px', borderRadius: '12px',
    background: GRAD_SOFT, border: `1px solid rgba(124,58,237,.12)`,
  },
  tipIcon: { fontSize: '22px', flexShrink: 0 },
  tipLabel: { fontSize: '14px', fontWeight: 700, color: TEXT, marginBottom: '2px' },
  tipDesc:  { fontSize: '12px', color: MUTED, lineHeight: 1.4 },
};