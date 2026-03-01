import { useState, useEffect } from "react";
import "../../Style/Admin.css";
import axios from "axios";

function Modal({ onClose, editData }) {
  if (!editData) return null;

  const fields = [
    { label: "Username", value: editData.Username, icon: "👤" },
    { label: "Email", value: editData.Email, icon: "✉️" },
    { label: "Phone", value: editData.Phone || "Not provided", icon: "📞" },
    { label: "Address", value: editData.Address || "Not provided", icon: "📍" },
    { label: "Role", value: editData.role?.charAt(0).toUpperCase() + editData.role?.slice(1) || "User", icon: "🛡️" },
  ];

  const initials = (editData.Username || "U").slice(0, 2).toUpperCase();

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,10,46,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "480px",
        padding: "0", boxShadow: "0 24px 60px rgba(147,51,234,0.18)",
        animation: "fadeUp 0.3s ease",
        fontFamily: "'DM Sans',sans-serif",
        overflow: "hidden",
      }}>
        {/* Header with avatar */}
        <div style={{
         background: "var(--brand-gradient)",
          padding: "32px 32px 40px",
          position: "relative",
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: "16px", right: "16px",
            width: "34px", height: "34px", borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", color: "#fff", backdropFilter: "blur(4px)",
          }}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
               background: "var(--brand-gradient)", border: "2.5px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: 800, color: "#fff",
              letterSpacing: "0.05em", backdropFilter: "blur(4px)",
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                {editData.Username}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
                {editData.Email}
              </p>
            </div>
          </div>
        </div>

        {/* Customer details */}
        <div style={{ padding: "28px 32px 32px" }}>
          <h3 style={{
            margin: "0 0 18px", fontSize: "11.5px", fontWeight: 700,
            color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Customer Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {fields.map((field, i) => (
              <div key={field.label} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px",
                background: i % 2 === 0 ? "#faf5ff" : "#fff",
                borderRadius: "10px",
              }}>
                <span style={{ fontSize: "18px", width: "28px", textAlign: "center" }}>{field.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "11px", fontWeight: 600, color: "#9ca3af",
                    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2px",
                  }}>
                    {field.label}
                  </div>
                  <div style={{
                    fontSize: "14px", fontWeight: 600, color: "#1a0a2e",
                    wordBreak: "break-word",
                  }}>
                    {field.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ID badge */}
          <div style={{
            marginTop: "20px", padding: "10px 16px",
            background: "#f3f4f6", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Customer ID
            </span>
            <span style={{
              fontSize: "12px", fontWeight: 700, color: "#6b7280",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              background: "#e5e7eb", padding: "4px 10px", borderRadius: "6px",
            }}>
              #{editData._id?.slice(0, 12).toUpperCase()}
            </span>
          </div>

          <button onClick={onClose} style={{
            width: "100%", marginTop: "24px", padding: "12px", borderRadius: "12px",
            border: "none", background: "var(--brand-gradient)",
            fontSize: "13.5px", fontWeight: 700, color: "#fff",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}



export default function AdminCustomers() {

  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);


  useEffect(() => {
    const fetchCustomers = async () => {
      let response = await axios("http://localhost:3000/customers/getcustomers");
      setData(response.data);
    }
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/customers/deletecustomer/${id}`);
    setData(data.filter(d => d._id !== id));
  }
  return (
    <div className="admin-stack">
      {showModal && <Modal onClose={() => { setShowModal(false); setEditItem(null); }} editData={editItem} />}
      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Customers</div>
            <div className="admin-muted">Customer list and basic insights.</div>
          </div>
          {/* <div>
            <button onClick={() => setShowModal(true)} className="admin-primary-btn">
              + Create Customer
            </button>
          </div> */}
        </div>

        <div className="admin-table admin-mt">
          <div className="admin-table-head">
            <div>ID</div>
            <div>Name</div>
            <div>Email</div>
            <div>Action</div>
            {/* <div>Orders</div> */}
          </div>
          {data.map((c) => (
            <div key={c._id} className="admin-table-row">
              <div className="admin-mono">#{c._id.slice(0, 7).toUpperCase()}</div>
              <div className="admin-strong">{c.Username}</div>
              <div className="admin-muted">{c.Email}</div>
              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>

                {/* Edit */}
                <button
                  onClick={() => { setEditItem(c); setShowModal(true); }}
                  title="Edit"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1.5px solid #e9d5ff", background: "#faf5ff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(c._id)}
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
              {/* <div className="admin-muted">{c.Orders.length}</div> */}
              {/* <div className="admin-right">{c.orders}</div> */}
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}
