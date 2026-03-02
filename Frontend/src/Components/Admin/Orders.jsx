import { useState, useEffect } from "react";
import "../../Style/Admin.css";
import axios from "axios";

function Modal({ onClose, editData }) {
  const [form, setForm] = useState(editData);

  const statusColor = {
    paid: { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
    pending: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    cancelled: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
  };

  const currentStatus =
    statusColor[form.Status?.toLowerCase()] || statusColor.pending;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(26,10,46,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "720px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          boxShadow: "0 24px 60px rgba(147,51,234,0.18)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "#1a0a2e",
              }}
            >
              Order Details
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12.5px",
                color: "#9ca3af",
              }}
            >
              Order #{form._id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1.5px solid #e9d5ff",
              background: "#faf5ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#9333ea",
            }}
          >
            ×
          </button>
        </div>

        {/* Status & Date Row */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: currentStatus.bg,
              color: currentStatus.text,
              border: `1.5px solid ${currentStatus.border}`,
            }}
          >
            ● {form.Status}
          </span>
          <span
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              background: "#f3f4f6",
              color: "#6b7280",
              border: "1.5px solid #e5e7eb",
            }}
          >
            📅 {form.date}
          </span>

          <span
            style={{
              width: "66px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--brand-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(147,51,234,0.25)",
            }}
          >
            <button onClick={()=>{window.location.href = `https://wa.me/${form.Phone}`;}}>Contact</button>
          </span>
        </div>

        {/* Customer Information */}
        <div
          style={{
            background: "#faf5ff",
            borderRadius: "14px",
            padding: "20px",
            border: "1.5px solid #e9d5ff",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#7c3aed",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Customer Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {[
              { icon: "👤", label: "Full Name", value: form.FullName },
              { icon: "📧", label: "Email", value: form.Email },
              { icon: "📞", label: "Phone", value: `+${form.Phone}` },
              { icon: "📍", label: "Address", value: form.Address },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  border: "1px solid #ede9fe",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    fontWeight: 600,
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.icon} {item.label}
                </div>
                <div
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "#1a0a2e",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "14px",
            padding: "20px",
            border: "1.5px solid #e2e8f0",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#7c3aed",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Items Ordered ({form.cart?.length || 0})
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {form.cart?.map((item, index) => (
              <div
                key={item._id || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "#fff",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  border: "1px solid #e2e8f0",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--brand-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(147,51,234,0.25)",
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#1a0a2e",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      fontFamily: "monospace",
                      marginTop: "2px",
                    }}
                  >
                    ID: {item._id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div
          style={{
            background: "var(--brand-gradient)",
            borderRadius: "14px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 14px rgba(147,51,234,0.3)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#e9d5ff",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Order Total
            </div>
            <div
              style={{ fontSize: "12px", color: "#c4b5fd", marginTop: "2px" }}
            >
              {form.cart?.length || 0} item{form.cart?.length > 1 ? "s" : ""}
            </div>
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            Rs. {form.Total?.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/orders/getorders",
        );
        setOrdersData(response.data);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/orders/deleteorder/${id}`);
      setOrdersData(ordersData.filter((o) => o._id !== id));
    } catch (error) {
      console.error("Error deleting order: ", error);
    }
  };

  return (
    <div className="admin-stack">
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setEditItem(null);
          }}
          editData={editItem}
        />
      )}
      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Orders</div>
            <div className="admin-muted">
              Track fulfillment and payment status.
            </div>
          </div>
        </div>

        <div className="admin-table admin-mt">
          <div className="admin-table-head">
            <div>Order</div>
            <div>Date</div>
            <div>Customer</div>
            <div className="justify-end">Actions</div>
          </div>
          {ordersData.length > 0 ? (
            ordersData.map((o, index) => (
              <div
                key={o._id?.toString() || `order-${index}`}
                className="admin-table-row"
              >
                <div className="admin-mono">
                  #{o._id.slice(-7).toUpperCase()}
                </div>
                <div className="admin-mono">{o.date}</div>
                <div className="admin-strong">{o.FullName}</div>
                <div className="flex gap-2">
                  {/* View Details */}
                  <button
                    onClick={() => {
                      setEditItem(o);
                      setShowModal(true);
                    }}
                    title="View Details"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "1.5px solid #e9d5ff",
                      background: "#faf5ff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(o._id)}
                    title="Delete"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "1.5px solid #ffe4e6",
                      background: "#fff5f7",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div>No orders available</div>
          )}
        </div>
      </div>
    </div>
  );
}
