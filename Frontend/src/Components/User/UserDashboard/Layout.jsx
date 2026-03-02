import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { C } from "./shared";

const NAV = [
  { to: "/userDashboard", label: "My Profile", icon: "👤" },
  { to: "/userDashboard/orders", label: "Track Orders", icon: "📦" },
  { to: "/userDashboard/returns", label: "Returns & Refunds", icon: "↩️" },
  { to: "/userDashboard/wishlist", label: "Wishlist", icon: "❤️" },
  { to: "/userDashboard/addresses", label: "Addresses", icon: "📍" },
];

export default function UserLayout() {
  const location = useLocation();
  const current = NAV.find(n =>
    n.to === "/userDashboard"
      ? location.pathname === "/userDashboard"
      : location.pathname.startsWith(n.to)
  ) || NAV[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD5FF; border-radius: 10px; }
        .user-nav-item:hover { background: #F3F0FF !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>

        {/* Sidebar */}
        <aside style={{ width: 260, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          {/* Brand */}
          <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${C.brand}, ${C.brandMid})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛍</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text, fontFamily: "'Sora',sans-serif" }}>My Account</div>
                <div style={{ fontSize: 12, color: C.muted }}>Store Management</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "12px 12px", flex: 1 }}>
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/userDashboard"}
                className="user-nav-item"
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  textDecoration: "none", fontSize: 14,
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.brand : C.text,
                  background: isActive ? C.brandLight : "transparent",
                  marginBottom: 2, transition: "all 0.15s",
                })}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
            <Link to="/"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", fontSize: 13, color: C.muted, fontFamily: "'DM Sans',sans-serif" }}>
              ← Back to Website
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif" }}>
              {current.icon} {current.label}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: C.muted }}>Manage your {current.label.toLowerCase()}</p>
          </div>

          <Outlet />
        </main>
      </div>
    </>
  );
}
