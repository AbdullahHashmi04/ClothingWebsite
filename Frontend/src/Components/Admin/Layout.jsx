import { NavLink, Link, Outlet } from "react-router-dom";
import "../../Style/Admin.css";
import Footer from "../Footer/Footer";
const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/discounts", label: "Discounts" },
  { to: "/admin/feedback", label: "Feedback" },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark" aria-hidden="true" />
          <div>
            <div className="admin-brand-title">Admin Panel</div>
            <div className="admin-brand-subtitle">Store Management</div>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`
              }
            >
              <span className="admin-nav-dot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link className="admin-back" to="/">
            ← Back to Website
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-topbar-title">Overview</div>
            <div className="admin-topbar-subtitle">Quick stats and actions</div>
          </div>

          {/* <div className="admin-topbar-actions">
            <div className="admin-search" role="search">
              <input
                className="admin-search-input"
                placeholder="Search orders, customers..."
                aria-label="Search admin"
              />
            </div>
            <button className="admin-primary-btn" type="button">
              + New Product
            </button>
          </div> */}
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
