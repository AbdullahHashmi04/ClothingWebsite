import { useEffect, useState } from "react";
import axios from 'axios'
import "../../Style/Admin.css";
const statusColor = {
  Active: { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e" },
  Expired: { bg: "#fff1f2", text: "#e11d48", dot: "#f43f5e" },
  Scheduled: { bg: "#fefce8", text: "#ca8a04", dot: "#facc15" },
};

const typeIcon = {
  "Percentage": "%",
  "Fixed Amount": "৳",
  "Free Shipping": "🚚",
};

function StatCard({ label, value, badge }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #f0eaff",
      borderRadius: "14px",
      padding: "22px 24px",
      flex: 1,
      minWidth: "160px",
      position: "relative",
      boxShadow: "0 1px 4px rgba(147,51,234,0.06)",
    }}>
      <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500, marginBottom: "8px", fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a0a2e", fontFamily: "'DM Sans',sans-serif" }}>{value}</div>
      {badge && (
        <div style={{
          position: "absolute", top: "18px", right: "18px",
          background: "#fdf4ff", border: "1px solid #e9d5ff",
          borderRadius: "100px", padding: "3px 10px",
          fontSize: "11px", fontWeight: 700, color: "#9333ea",
          fontFamily: "'DM Sans',sans-serif",
        }}>{badge}</div>
      )}
    </div>
  );
}

function Modal({ onClose, editData }) {
  const [form, setForm] = useState(editData || {
    code: "", type: "Percentage", value: "", minOrder: "", usageLimit: "", expiry: "", status: "Active"
  });

  const handleCreate = async () => {
    await axios.post("http://localhost:3000/discounts/createDiscount", form)
    onClose()
    window.location.reload();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,10,46,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "480px",
        padding: "32px", boxShadow: "0 24px 60px rgba(147,51,234,0.18)",
        animation: "fadeUp 0.3s ease",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1a0a2e" }}>
              {editData ? "Edit Discount" : "Create New Discount"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#9ca3af" }}>
              {editData ? "Update promo code details" : "Add a new promo code for your store"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: "34px", height: "34px", borderRadius: "50%",
            border: "1.5px solid #e9d5ff", background: "#faf5ff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", color: "#9333ea",
          }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Promo Code", key: "code", placeholder: "e.g. SUMMER25", type: "text" },
            { label: "Discount Value", key: "value", placeholder: "e.g. 25", type: "number" },
            { label: "Minimum Order (Rs)", key: "minOrder", placeholder: "e.g. 500", type: "number" },
            { label: "Usage Limit", key: "usageLimit", placeholder: "e.g. 100", type: "number" },
            { label: "Expiry Date", key: "expiry", placeholder: "", type: "date" },
          ].map(field => (
            <div key={field.key}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", letterSpacing: "0.04em" }}>
                {field.label.toUpperCase()}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1.5px solid #e9d5ff", borderRadius: "10px",
                  fontSize: "13.5px", color: "#1a0a2e",
                  outline: "none", fontFamily: "'DM Sans',sans-serif",
                  background: "#fefcff", boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "6px", letterSpacing: "0.04em" }}>
              TYPE
            </label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1.5px solid #e9d5ff", borderRadius: "10px",
                fontSize: "13.5px", color: "#1a0a2e",
                outline: "none", fontFamily: "'DM Sans',sans-serif",
                background: "#fefcff", boxSizing: "border-box",
              }}
            >
              <option>Percentage</option>
              <option>Fixed Amount</option>
              <option>Free Shipping</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px", borderRadius: "10px",
            border: "1.5px solid #e9d5ff", background: "#fff",
            fontSize: "13.5px", fontWeight: 600, color: "#6b7280",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          }}>Cancel</button>
          {editData ? <button onClick={onClose} style={{
            flex: 2, padding: "11px", borderRadius: "10px",
            border: "none", background: "linear-gradient(135deg,#9333ea,#c084fc)",
            fontSize: "13.5px", fontWeight: 700, color: "#fff",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
          }}>
            Save Changes
          </button> :
            <button onClick={handleCreate} style={{
              flex: 2, padding: "11px", borderRadius: "10px",
              border: "none", background: "linear-gradient(135deg,#9333ea,#c084fc)",
              fontSize: "13.5px", fontWeight: 700, color: "#fff",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
            }}>
              Create Discount
            </button>}
        </div>
      </div>
    </div>
  );
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [totalUser, setTotalUser] = useState([])

  useEffect(() => {

    const fetch = async () => {

      const res = await axios("http://localhost:3000/customers/getcustomers")
      setTotalUser(res.data)

      const res2 = await axios("http://localhost:3000/discounts/getDiscount")
      setDiscounts(res2.data)

    }

    fetch()

  }, [])

  const filtered = filterStatus === "All" ? discounts : discounts.filter(d => d.status === filterStatus);

  const active = discounts.filter(d => d.status === "Active").length;
  const expired = discounts.filter(d => d.status === "Expired").length;
  const scheduled = discounts.filter(d => d.status === "Scheduled").length;

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/discounts/deleteDiscount/${id}`)
    setDiscounts(discounts.filter(d => d._id !== id));
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#fafafa", minHeight: "100vh", padding: "32px 36px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.88; }
      `}</style>

      {showModal && <Modal onClose={() => { setShowModal(false); setEditItem(null); }} editData={editItem} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1a0a2e" }}>Discounts</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#9ca3af" }}>Manage promo codes and offers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="admin-primary-btn"
        >
          + Create Discount
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
        <StatCard label="Active Discounts" value={active} badge={`${active} live`} />
        <StatCard label="Scheduled" value={scheduled} badge="upcoming" />
        <StatCard label="Expired" value={expired} badge="inactive" />
        <StatCard label="Total Uses" value={totalUser.length} badge="all time" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["All", "Active", "Scheduled", "Expired"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "7px 18px", borderRadius: "100px",
              border: filterStatus === s ? "1.5px solid transparent" : "1.5px solid #e9d5ff",
              background: filterStatus === s ? "linear-gradient(135deg,#9333ea,#c084fc)" : "#fff",
              color: filterStatus === s ? "#fff" : "#6b7280",
              fontSize: "12.5px", fontWeight: filterStatus === s ? 700 : 500,
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              boxShadow: filterStatus === s ? "0 4px 14px rgba(147,51,234,0.22)" : "none",
              transition: "all 0.2s",
            }}
          >{s}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #f0eaff",
        boxShadow: "0 1px 4px rgba(147,51,234,0.06)",
        overflow: "hidden",
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Table head */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 110px 120px 120px 110px 130px",
          padding: "14px 24px",
          borderBottom: "1px solid #f3e8ff",
          background: "#faf5ff",
        }}>
          {["Code", "Type", "Value", "Status", "Actions"].map(h => (
            <span key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((d, i) => {
          const sc = statusColor[d.status];
          return (
            <div
              key={d._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 110px 120px 120px 110px 130px",
                padding: "16px 24px",
                borderBottom: i < filtered.length - 1 ? "1px solid #f9f5ff" : "none",
                alignItems: "center",
                transition: "background 0.15s",
                animation: `fadeUp 0.35s ease both`,
                animationDelay: `${i * 40}ms`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fdf9ff"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {/* Code */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "linear-gradient(135deg,#f5f3ff,#fdf4ff)",
                  border: "1.5px solid #e9d5ff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", flexShrink: 0,
                }}>
                  {typeIcon[d.type]}
                </div> */}
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1a0a2e", letterSpacing: "0.04em" }}>{d.code}</div>
                  <div style={{ fontSize: "11px", color: "#c4b5d4", marginTop: "2px" }}>Expires {d.expiry}</div>
                </div>
              </div>

              {/* Type */}
              <span style={{ fontSize: "12.5px", color: "#6b7280" }}>{d.expiryDate}</span>

              {/* Value */}
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#9333ea" }}>
                {d.type === "Percentage" ? `${d.value}%` : d.type === "Fixed Amount" ? `Rs ${d.value}` : "Free"}
              </span>

              {/* Status */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                background: sc.bg, borderRadius: "100px",
                padding: "4px 10px", width: "fit-content",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                <span style={{ fontSize: "11.5px", fontWeight: 600, color: sc.text }}>{d.status}</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>

                {/* Edit */}
                <button
                  onClick={() => { setEditItem(d); setShowModal(true); }}
                  title="Edit"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1.5px solid #e9d5ff", background: "#faf5ff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(d._id)}
                  title="Delete"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1.5px solid #ffe4e6", background: "#fff5f7",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#c4b5d4" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏷️</div>
            <p style={{ fontSize: "15px", color: "#9ca3af", margin: 0 }}>No discounts found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}