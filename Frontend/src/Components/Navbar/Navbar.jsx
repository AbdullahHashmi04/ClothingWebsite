import { useState, useRef, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "material-design-iconic-font/dist/css/material-design-iconic-font.min.css";
import {
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CartContext from "../Context/CartContext";
import "../../Style/Navbar.css";

const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

function Avatar({ name, avatarUrl, size = 36 }) {
  const initials = name ? name.slice(0, 1).toUpperCase() : "U";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: "var(--brand-gradient)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: "600",
        color: "#1a1410",
        fontFamily: "'DM Serif Display', Georgia, serif",
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div>{initials}</div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, variant = "default", index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const isDanger = variant === "danger";
  return (
    <li
      role="menuitem" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 14px",
        cursor: "pointer",
        fontSize: "13.5px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: "440",
        letterSpacing: "0.01em",
        color: isDanger
          ? hovered
            ? "#c0392b"
            : "#e05c4b"
          : hovered
            ? "#0f0c08"
            : "#4a3f30",
        background: hovered
          ? isDanger
            ? "rgba(220,60,40,0.06)"
            : "rgba(200,168,75,0.08)"
          : "transparent",
        borderRadius: "8px",
        margin: "0 6px",
        transition: "all 0.15s ease",
        outline: "none",
        userSelect: "none",
        animation: `itemIn 0.22s ease ${index * 40}ms both`,
      }}
    >
      <span
        style={{
          color: isDanger
            ? hovered
              ? "#c0392b"
              : "#e05c4b"
            : hovered
              ? "#c8a84b"
              : "#9a8060",
          display: "flex",
          transition: "color 0.15s ease",
        }}
      >
        {icon}
      </span>
      {label}
    </li>
  );
}

function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const navigate = useNavigate();
  const safeUser = user || {};

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const profilePath = safeUser?.role === "admin" ? "/admin" : "/userDashboard";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;440;500;600&display=swap');
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes itemIn {
          from { opacity: 0; transform: translateX(-5px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ud-trigger:focus-visible { outline: 2px solid #c8a84b; outline-offset: 3px; }
      `}</style>

      <div
        ref={containerRef}
        style={{ position: "relative", display: "inline-block", minWidth: "168px" }}
      >
        <button
          ref={triggerRef}
          className="ud-trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "9px",
            padding: "5px 12px 5px 5px", borderRadius: "40px",
            background: open ? "rgba(200,168,75,0.12)" : "transparent",
            border: "1px solid", borderColor: open ? "rgba(200,168,75,0.45)" : "rgba(200,168,75,0.22)",
            cursor: "pointer", transition: "all 0.18s ease", outline: "none",
          }}
          onMouseEnter={(e) => {
            if (!open) {
              e.currentTarget.style.background = "rgba(200,168,75,0.07)";
              e.currentTarget.style.borderColor = "rgba(200,168,75,0.38)";
            }
          }}
          onMouseLeave={(e) => {
            if (!open) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(200,168,75,0.22)";
            }
          }}
        >
          <Avatar name={safeUser.Username} avatarUrl={safeUser.picture} size={32} />
          <div style={{ textAlign: "left", lineHeight: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "500", fontFamily: "'DM Sans',sans-serif", color: "#1a1410", letterSpacing: "0.01em" }}>
              {safeUser.Username || "Account"}
            </div>
            <div style={{ fontSize: "11px", color: "#b8a070", fontFamily: "'DM Sans',sans-serif", marginTop: "2px" }}>
              {safeUser.role || "User"}
            </div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a8060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", marginLeft: "1px" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div role="menu" aria-label="User menu" style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", width: "min(300px, 90vw)",
            background: "#fffdf8", border: "1px solid rgba(200,168,75,0.18)", borderRadius: "14px",
            boxShadow: "0 10px 36px rgba(26,20,10,0.13), 0 2px 8px rgba(26,20,10,0.06)",
            zIndex: 50, overflow: "hidden",
            animation: "dropdownIn 0.22s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div style={{
              padding: "14px 16px 13px",
              borderBottom: "1px solid rgba(200,168,75,0.12)",
              background: "linear-gradient(135deg, rgba(200,168,75,0.06) 0%, transparent 100%)",
              display: "flex", alignItems: "center", gap: "11px",
            }}>
              <Avatar name={safeUser.Username} avatarUrl={safeUser.picture} size={40} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", fontFamily: "'DM Serif Display',Georgia,serif", color: "#1a1410", lineHeight: 1.3 }}>
                  {safeUser.Username || "User"}
                </div>
                <div style={{ fontSize: "11.5px", color: "#9a8060", fontFamily: "'DM Sans',sans-serif", marginTop: "2px" }}>
                  {safeUser.Email || ""}
                </div>
              </div>
            </div>

            <ul role="presentation" style={{ listStyle: "none", margin: 0, padding: "6px 0" }}>
              <MenuItem
                icon={<ProfileIcon />}
                label="Profile"
                onClick={() => {
                  setOpen(false);
                  navigate(profilePath);
                }}
                index={0}
              />
            </ul>

            <div style={{ height: "1px", background: "rgba(200,168,75,0.12)", margin: "2px 14px" }} />

            <ul role="presentation" style={{ listStyle: "none", margin: 0, padding: "6px 0 8px" }}>
              <MenuItem
                icon={<LogoutIcon />}
                label="Log out"
                onClick={() => {
                  setOpen(false);
                  onLogout?.();
                }}
                variant="danger"
                index={2}
              />
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, RegisterStatus, loginStatus, user, setUserInfo, setLoginStatus } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();

  const isLoggedIn = loginStatus || isAuthenticated;
  const dashboardPath = user?.role === "admin" ? "/admin" : "/userDashboard";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/catalog", label: "Catalog" },
    { path: "/trending", label: "Trending" },
    { path: "/wearcast", label: "WearCast" }
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    setLoginStatus(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`navbar navbar-enter ${isScrolled ? "navbar-scrolled" : "navbar-transparent"}`}
      >
        <div className="navbar-container">
          <div className="navbar-content">
            <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="navbar-logo-icon-wrapper"
              >
                <div className="navbar-logo-glow"></div>
                <ShoppingBag className="navbar-logo-icon" />
              </motion.div>
              <span className="navbar-logo-text">Smartify</span>
            </Link>

            <div className="navbar-desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`navbar-link ${isActive(link.path) ? "navbar-link-active" : ""}`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="navbar-link-active-indicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="navbar-actions navbar-actions-desktop">
              {cart.length > 0 && (
                <Link to="/mycart" className="navbar-cart-button">
                  <ShoppingBag className="navbar-cart-icon" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="navbar-cart-badge"
                  >
                    {cart.length}
                  </motion.span>
                </Link>
              )}

              {isLoggedIn ? (
                <UserDropdown user={user} onLogout={handleLogout} />
              ) : (
                <Link to="/login" className="navbar-login-button">
                  Sign In
                </Link>
              )}

              {!RegisterStatus && !isLoggedIn && (
                <Link to="/signup" className="navbar-signup-button">
                  Sign Up
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="navbar-mobile-toggle"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="navbar-mobile-icon" />
              ) : (
                <Menu className="navbar-mobile-icon" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24 }}
            className="navbar-mobile-menu"
          >
            <div className="navbar-mobile-content">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`navbar-mobile-link ${isActive(link.path) ? "navbar-mobile-link-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {cart.length > 0 && (
                <Link
                  to="/mycart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="navbar-mobile-link"
                >
                  Cart ({cart.length})
                </Link>
              )}

              <div className="navbar-mobile-divider">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={dashboardPath}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="navbar-mobile-auth-button"
                    >
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="navbar-mobile-auth-button">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="navbar-mobile-auth-button"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="navbar-mobile-auth-button navbar-mobile-signup-button"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
