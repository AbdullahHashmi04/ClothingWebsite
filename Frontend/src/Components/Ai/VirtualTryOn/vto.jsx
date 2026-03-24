import React, { useContext, useEffect, useState, useRef } from 'react'
import CartContext from '../../Context/CartContext';
import axios from "axios"

export default function Vto() {

  const [humanPreview, setHumanPreview] = useState(null);
  const [humanFile, setHumanFile] = useState(null);
  const { ImageVto } = useContext(CartContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('upper_body');
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Simulated progress bar during loading
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleTryOn = async () => {
    if (!humanFile) {
      setError("Please upload your photo first.");
      return;
    }
    if (!ImageVto || ImageVto.length === 0 || !ImageVto[0]?.img) {
      setError("No cloth image selected. Please select a product first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1) Fetch the cloth image URL and convert to a File for upload
      const clothImageUrl = ImageVto[0].img;
      const clothResponse = await fetch(clothImageUrl);
      const clothBlob = await clothResponse.blob();
      const clothFile = new File([clothBlob], "cloth.jpg", {
        type: clothBlob.type || "image/jpeg",
      });

      // 2) Build FormData
      const formData = new FormData();
      formData.append('person', humanFile);
      formData.append('cloth', clothFile);
      formData.append('category', category);
      formData.append('garment_des', ImageVto[0]?.name || 'clothing item');

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 3) Call the Express backend /viton endpoint (which calls Replicate)
      const response = await axios.post(
        `http://localhost:3000/viton`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...headers,
          },
          timeout: 300000, // 5 minute timeout for Replicate processing
        }
      );

      console.log("Try-on API response:", response.data);

      if (response.data.success && response.data.result_url) {
        setResult(response.data.result_url);
      } else {
        throw new Error(response.data.message || 'Virtual try-on failed.');
      }
    } catch (err) {
      console.error('Try-on error:', err);
      let errorMsg = 'Virtual try-on failed. Please try again.';

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

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

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  const clearPerson = () => {
    setHumanPreview(null);
    setHumanFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (ImageVto && ImageVto.length > 0) {
      console.log('Cloth image URL:', ImageVto[0].img || ImageVto[0].imageUrl || ImageVto[0].image);
    }
  }, [ImageVto]);

  const categories = [
    { value: 'upper_body', label: 'Upper Body', icon: '👔' },
    { value: 'lower_body', label: 'Lower Body', icon: '👖' },
    { value: 'dresses', label: 'Dresses', icon: '👗' },
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* Animated background elements */}
      <div style={styles.bgOrb1}></div>
      <div style={styles.bgOrb2}></div>
      <div style={styles.bgOrb3}></div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerBadge}>
          <span style={styles.badgeIcon}>✨</span>
          <span style={styles.badgeText}>AI-Powered</span>
        </div>
        <h1 style={styles.title}>Virtual Try-On</h1>
        <p style={styles.subtitle}>
          Experience clothes before you buy — powered by IDM-VTON AI
        </p>
      </div>

      {/* Category Selector */}
      <div style={styles.categoryRow}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            style={{
              ...styles.categoryBtn,
              ...(category === cat.value ? styles.categoryBtnActive : {}),
            }}
          >
            <span style={styles.categoryIcon}>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      {loading && (
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
        </div>
      )}

      {/* Main Grid */}
      <div style={styles.mainGrid}>

        {/* Person Image Upload */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardNumber}>1</span>
            <span style={styles.cardTitle}>Your Photo</span>
            {humanPreview && (
              <button onClick={clearPerson} style={styles.clearBtn}>✕</button>
            )}
          </div>
          <div
            style={{
              ...styles.dropZone,
              ...(dragActive ? styles.dropZoneActive : {}),
              ...(humanPreview ? styles.dropZoneHasImage : {}),
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
              <img src={humanPreview} alt="Your Photo" style={styles.previewImage} />
            ) : (
              <div style={styles.uploadContent}>
                <div style={styles.uploadIconWrap}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p style={styles.uploadTitle}>
                  {dragActive ? 'Drop your photo here' : 'Upload your photo'}
                </p>
                <p style={styles.uploadHint}>Drag & drop or click to browse</p>
                <p style={styles.uploadTip}>
                  💡 Clear, front-facing photo works best
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cloth Image */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardNumber}>2</span>
            <span style={styles.cardTitle}>Selected Garment</span>
          </div>
          <div style={{
            ...styles.dropZone,
            ...(ImageVto && ImageVto.length > 0 ? styles.dropZoneHasImage : {}),
            cursor: 'default',
          }}>
            {ImageVto && ImageVto.length > 0 ? (
              <div style={styles.clothPreview}>
                <img
                  src={ImageVto[0].img || ImageVto[0].imageUrl || ImageVto[0].image}
                  alt={ImageVto[0].name || "Selected Cloth"}
                  style={styles.previewImage}
                />
                {ImageVto[0].name && (
                  <div style={styles.clothLabel}>
                    {ImageVto[0].name}
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.uploadContent}>
                <div style={styles.emptyClothIcon}>👕</div>
                <p style={styles.uploadTitle}>No garment selected</p>
                <p style={styles.uploadHint}>
                  Browse products and click "Try On" on any item
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardNumber}>3</span>
            <span style={styles.cardTitle}>Result</span>
            {result && (
              <div style={styles.resultActions}>
                <button onClick={handleDownload} style={styles.downloadBtn} title="Download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                <button onClick={clearResult} style={styles.clearBtn}>✕</button>
              </div>
            )}
          </div>
          <div style={{
            ...styles.dropZone,
            ...(result ? styles.dropZoneHasImage : {}),
            cursor: 'default',
          }}>
            {loading ? (
              <div style={styles.loadingContent}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingTitle}>AI is working its magic...</p>
                <p style={styles.loadingHint}>This usually takes 20-45 seconds</p>
                <div style={styles.loadingDots}>
                  <span style={{ ...styles.dot, animationDelay: '0s' }}>●</span>
                  <span style={{ ...styles.dot, animationDelay: '0.3s' }}>●</span>
                  <span style={{ ...styles.dot, animationDelay: '0.6s' }}>●</span>
                </div>
              </div>
            ) : result ? (
              <img src={result} alt="VTO Result" style={styles.previewImage} />
            ) : (
              <div style={styles.uploadContent}>
                <div style={styles.resultPlaceholderIcon}>✨</div>
                <p style={styles.uploadTitle}>Try-on result</p>
                <p style={styles.uploadHint}>Your virtual fitting will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Try On Button */}
      <div style={styles.buttonRow}>
        <button
          onClick={handleTryOn}
          disabled={loading}
          style={{
            ...styles.tryOnBtn,
            ...(loading ? styles.tryOnBtnDisabled : {}),
          }}
        >
          {loading ? (
            <>
              <span style={styles.btnSpinner}></span>
              Processing...
            </>
          ) : (
            <>
              <span style={styles.btnIcon}>🪄</span>
              Try It On
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.errorClose}>✕</button>
        </div>
      )}

      {/* Tips Section */}
      <div style={styles.tipsCard}>
        <h4 style={styles.tipsTitle}>
          <span>📌</span> Tips for Best Results
        </h4>
        <div style={styles.tipsGrid}>
          <div style={styles.tipItem}>
            <div style={styles.tipIcon}>📸</div>
            <div>
              <p style={styles.tipLabel}>Good Lighting</p>
              <p style={styles.tipDesc}>Use a clear, well-lit photo</p>
            </div>
          </div>
          <div style={styles.tipItem}>
            <div style={styles.tipIcon}>🧍</div>
            <div>
              <p style={styles.tipLabel}>Front Facing</p>
              <p style={styles.tipDesc}>Stand straight facing the camera</p>
            </div>
          </div>
          <div style={styles.tipItem}>
            <div style={styles.tipIcon}>👕</div>
            <div>
              <p style={styles.tipLabel}>Fitted Clothing</p>
              <p style={styles.tipDesc}>Wear fitted clothes for accuracy</p>
            </div>
          </div>
          <div style={styles.tipItem}>
            <div style={styles.tipIcon}>📐</div>
            <div>
              <p style={styles.tipLabel}>Full Visible</p>
              <p style={styles.tipDesc}>Ensure your upper body is visible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.1); }
          66% { transform: translate(20px, -30px) scale(0.9); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, 25px) scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


/* ─── Inline Styles ─────────────────────────────────────────────── */
const styles = {
  pageWrapper: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 60%, #0f0f1a 100%)',
    padding: '40px 20px 80px',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // Background orbs
  bgOrb1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
    animation: 'float1 20s ease-in-out infinite',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute',
    top: '50%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
    animation: 'float2 25s ease-in-out infinite',
    pointerEvents: 'none',
  },
  bgOrb3: {
    position: 'absolute',
    bottom: '-5%',
    left: '30%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
    animation: 'float3 18s ease-in-out infinite',
    pointerEvents: 'none',
  },

  // Header
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeInUp 0.6s ease-out',
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: '100px',
    background: 'rgba(139, 92, 246, 0.15)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    marginBottom: '16px',
  },
  badgeIcon: {
    fontSize: '14px',
  },
  badgeText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#a78bfa',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.5)',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.5',
  },

  // Category selector
  categoryRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
  },
  categoryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  categoryBtnActive: {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
    border: '1px solid rgba(139, 92, 246, 0.5)',
    color: '#ffffff',
    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
  },
  categoryIcon: {
    fontSize: '18px',
  },

  // Progress bar
  progressContainer: {
    maxWidth: '900px',
    margin: '0 auto 24px',
    height: '3px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  progressBar: {
    height: '100%',
    borderRadius: '10px',
    background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s linear infinite',
    transition: 'width 0.5s ease',
  },

  // Main grid
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1100px',
    margin: '0 auto 32px',
    position: 'relative',
    zIndex: 1,
  },

  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    animation: 'fadeInUp 0.6s ease-out',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  cardNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
  },
  cardTitle: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  clearBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    transition: 'all 0.2s',
  },

  // Drop zone
  dropZone: {
    margin: '16px',
    minHeight: '320px',
    borderRadius: '16px',
    border: '2px dashed rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  dropZoneActive: {
    border: '2px dashed rgba(139, 92, 246, 0.6)',
    background: 'rgba(139, 92, 246, 0.05)',
  },
  dropZoneHasImage: {
    border: '2px solid rgba(139, 92, 246, 0.2)',
    background: 'rgba(0,0,0,0.2)',
  },

  // Preview image
  previewImage: {
    maxWidth: '100%',
    maxHeight: '320px',
    objectFit: 'contain',
    borderRadius: '8px',
  },

  // Upload content
  uploadContent: {
    textAlign: 'center',
    padding: '32px',
  },
  uploadIconWrap: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: '#a78bfa',
  },
  uploadTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '6px',
  },
  uploadHint: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '12px',
  },
  uploadTip: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.03)',
    padding: '8px 14px',
    borderRadius: '8px',
    display: 'inline-block',
  },

  // Cloth preview
  clothPreview: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
  },
  clothLabel: {
    marginTop: '12px',
    padding: '6px 14px',
    borderRadius: '8px',
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    color: '#a78bfa',
    fontSize: '13px',
    fontWeight: '500',
  },

  // Empty cloth
  emptyClothIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5,
  },

  // Loading
  loadingContent: {
    textAlign: 'center',
    padding: '32px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(139, 92, 246, 0.1)',
    borderTopColor: '#8b5cf6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
  loadingTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '6px',
  },
  loadingHint: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '16px',
  },
  loadingDots: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
  },
  dot: {
    color: '#8b5cf6',
    fontSize: '10px',
    animation: 'pulse-dot 1.2s ease-in-out infinite',
  },

  // Result placeholder
  resultPlaceholderIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5,
  },
  resultActions: {
    display: 'flex',
    gap: '6px',
  },
  downloadBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(139, 92, 246, 0.1)',
    color: '#a78bfa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  // Try On button
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
    position: 'relative',
    zIndex: 1,
  },
  tryOnBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 48px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)',
    color: '#fff',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
    letterSpacing: '0.3px',
    position: 'relative',
    overflow: 'hidden',
  },
  tryOnBtnDisabled: {
    background: 'rgba(255,255,255,0.1)',
    boxShadow: 'none',
    cursor: 'not-allowed',
    color: 'rgba(255,255,255,0.4)',
  },
  btnIcon: {
    fontSize: '20px',
  },
  btnSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },

  // Error box
  errorBox: {
    maxWidth: '600px',
    margin: '0 auto 32px',
    padding: '14px 20px',
    borderRadius: '14px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(10px)',
  },
  errorIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  errorClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'rgba(252, 165, 165, 0.6)',
    cursor: 'pointer',
    fontSize: '14px',
    flexShrink: 0,
  },

  // Tips card
  tipsCard: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '28px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    zIndex: 1,
  },
  tipsTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  tipItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  tipIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  tipLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '2px',
  },
  tipDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: '1.4',
  },
};