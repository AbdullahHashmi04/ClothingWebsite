import { useState, useEffect } from "react";
import "../../Style/Admin.css";
import axios from "axios";

const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");

const getStatusClass = (status) => {
  const key = String(status || "pending").toLowerCase();
  if (["paid", "completed", "delivered"].includes(key)) return "admin-pill-paid";
  if (["processing", "confirmed"].includes(key)) return "admin-pill-processing";
  if (["shipped"].includes(key)) return "admin-pill-shipped";
  if (["cancelled", "canceled", "failed"].includes(key)) return "admin-pill-danger";
  return "admin-pill-warn";
};

function Modal({ onClose, editData }) {
  if (!editData) return null;

  const cartItems = Array.isArray(editData.cart) ? editData.cart : [];

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card admin-modal-card-lg">
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title">Order Details</h2>
            <p className="admin-modal-subtitle">Order #{String(editData._id || "").slice(-8).toUpperCase() || "N/A"}</p>
          </div>
          <button className="admin-modal-close" onClick={onClose} type="button" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="admin-inline admin-modal-meta">
          <span className={`admin-pill ${getStatusClass(editData.Status)}`}>
            {editData.Status || "Pending"}
          </span>
          <span className="admin-pill">{editData.date || "No date"}</span>
          <a className="admin-secondary-btn" href={`https://wa.me/${editData.Phone || ""}`} target="_blank" rel="noreferrer">
            Contact
          </a>
        </div>

        <div className="admin-modal-section">
          <h3 className="admin-section-title">Customer Information</h3>
          <div className="admin-info-grid">
            <div className="admin-info-card">
              <div className="admin-info-label">Full Name</div>
              <div className="admin-info-value">{editData.FullName || "Unknown"}</div>
            </div>
            <div className="admin-info-card">
              <div className="admin-info-label">Email</div>
              <div className="admin-info-value">{editData.Email || "No email"}</div>
            </div>
            <div className="admin-info-card">
              <div className="admin-info-label">Phone</div>
              <div className="admin-info-value">+{editData.Phone || "N/A"}</div>
            </div>
            <div className="admin-info-card">
              <div className="admin-info-label">Address</div>
              <div className="admin-info-value">{editData.Address || "Not provided"}</div>
            </div>
          </div>
        </div>

        <div className="admin-modal-section">
          <h3 className="admin-section-title">Items Ordered ({cartItems.length})</h3>
          <div className="admin-stack">
            {cartItems.length ? (
              cartItems.map((item, index) => (
                <div key={item._id || index} className="admin-order-item">
                  <div className="admin-order-item-index">{index + 1}</div>
                  <div>
                    <div className="admin-strong">{item.name || "Unnamed Item"}</div>
                    <div className="admin-muted admin-xs">ID: {item._id || "N/A"}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-empty-state">No cart items available for this order.</div>
            )}
          </div>
        </div>

        <div className="admin-total-panel">
          <div>
            <div className="admin-total-label">Order Total</div>
            <div className="admin-total-subtext">
              {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
            </div>
          </div>
          <div className="admin-total-value">Rs. {Number(editData.Total || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const pendingOrders = ordersData.filter(
    (order) => String(order.Status || "").toLowerCase() === "pending"
  ).length;
  const completedOrders = ordersData.filter((order) =>
    ["paid", "completed", "delivered"].includes(String(order.Status || "").toLowerCase())
  ).length;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URI}/orders/getorders`,
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
      await axios.delete(`${BACKEND_URI}/orders/deleteorder/${id}`);
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

      <section className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Fulfillment Desk</p>
          <h2 className="admin-page-title">Orders</h2>
          <p className="admin-page-subtitle">Track payment status, buyers, and fulfillment progress in real time.</p>
        </div>
      </section>

      <section className="admin-summary-strip">
        <article className="admin-summary-item">
          <div className="admin-summary-label">Total Orders</div>
          <div className="admin-summary-value">{ordersData.length}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Pending</div>
          <div className="admin-summary-value">{pendingOrders}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Completed</div>
          <div className="admin-summary-value">{completedOrders}</div>
        </article>
      </section>

      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Order Queue</div>
            <div className="admin-muted">Review order details, contact customers, and remove invalid entries.</div>
          </div>
        </div>

        <div className="admin-table admin-mt">
          <div className="admin-table-head admin-table-head-orders">
            <div>Order</div>
            <div>Date</div>
            <div>Customer</div>
            <div>Status</div>
            <div className="admin-right">Total</div>
            <div className="admin-right">Actions</div>
          </div>
          {ordersData.length > 0 ? (
            ordersData.map((o, index) => (
              <div
                key={o._id?.toString() || `order-${index}`}
                className="admin-table-row admin-table-row-orders"
              >
                <div className="admin-mono">#{String(o._id || "").slice(-7).toUpperCase() || "N/A"}</div>
                <div className="admin-mono">{o.date}</div>
                <div>
                  <div className="admin-strong">{o.FullName || "Unknown"}</div>
                  <div className="admin-muted">{o.Email || "No email"}</div>
                </div>
                <div>
                  <span className={`admin-pill ${getStatusClass(o.Status)}`}>{o.Status || "Pending"}</span>
                </div>
                <div className="admin-right admin-strong">Rs. {Number(o.Total || 0).toLocaleString()}</div>
                <div className="admin-actions-right">
                  <button
                    onClick={() => {
                      setEditItem(o);
                      setShowModal(true);
                    }}
                    title="View Details"
                    className="admin-icon-btn"
                    type="button"
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

                  <button
                    onClick={() => handleDelete(o._id)}
                    title="Delete"
                    className="admin-icon-btn admin-icon-btn-danger"
                    type="button"
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
            <div className="admin-empty-state">No orders available</div>
          )}
        </div>
      </div>
    </div>
  );
}
