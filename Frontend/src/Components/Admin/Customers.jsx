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
    <div className="admin-modal-overlay">
      <div className="admin-modal-card admin-modal-card-sm">
        <div className="admin-customer-hero">
          <button onClick={onClose} className="admin-modal-close admin-modal-close-light" type="button" aria-label="Close modal">
            ×
          </button>
          <div className="admin-inline">
            <div className="admin-avatar-lg">
              {initials}
            </div>
            <div>
              <h2 className="admin-modal-title admin-modal-title-light">
                {editData.Username}
              </h2>
              <p className="admin-modal-subtitle admin-modal-subtitle-light">
                {editData.Email}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-modal-body">
          <h3 className="admin-section-title">
            Customer Details
          </h3>
          <div className="admin-detail-list">
            {fields.map((field, i) => (
              <div key={field.label} className={`admin-detail-item ${i % 2 === 0 ? "admin-detail-item-soft" : ""}`}>
                <span className="admin-detail-icon">{field.icon}</span>
                <div>
                  <div className="admin-detail-label">
                    {field.label}
                  </div>
                  <div className="admin-detail-value">
                    {field.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-id-chip">
            <span className="admin-detail-label">
              Customer ID
            </span>
            <span className="admin-id-value">#{String(editData._id || "").slice(0, 12).toUpperCase() || "N/A"}</span>
          </div>

          <button onClick={onClose} className="admin-primary-btn admin-block-btn" type="button">
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

  const totalAdmins = data.filter((customer) => String(customer.role || "").toLowerCase() === "admin").length;
  const totalUsers = data.length - totalAdmins;

  return (
    <div className="admin-stack">
      {showModal && <Modal onClose={() => { setShowModal(false); setEditItem(null); }} editData={editItem} />}

      <section className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Community Overview</p>
          <h2 className="admin-page-title">Customers</h2>
          <p className="admin-page-subtitle">View identities, contact details, and access level in a cleaner profile table.</p>
        </div>
      </section>

      <section className="admin-summary-strip">
        <article className="admin-summary-item">
          <div className="admin-summary-label">Total Customers</div>
          <div className="admin-summary-value">{data.length}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Admins</div>
          <div className="admin-summary-value">{totalAdmins}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Users</div>
          <div className="admin-summary-value">{totalUsers}</div>
        </article>
      </section>

      <div className="admin-card admin-card-pad">
        <div className="admin-card-row">
          <div>
            <div className="admin-card-title">Customer Directory</div>
            <div className="admin-muted">Open profile details, verify contacts, and remove invalid accounts.</div>
          </div>
        </div>

        <div className="admin-table admin-mt">
          <div className="admin-table-head admin-table-head-customers">
            <div>ID</div>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div className="admin-right">Action</div>
          </div>
          {data.map((c) => (
            <div key={c._id} className="admin-table-row admin-table-row-customers">
              <div className="admin-mono">#{String(c._id || "").slice(0, 7).toUpperCase() || "N/A"}</div>
              <div>
                <div className="admin-strong">{c.Username || "Unknown"}</div>
                <div className="admin-muted admin-xs">{c.Phone ? `+${c.Phone}` : "No phone"}</div>
              </div>
              <div className="admin-muted">{c.Email || "No email"}</div>
              <div>
                <span className={`admin-pill ${String(c.role || "user").toLowerCase() === "admin" ? "admin-pill-processing" : "admin-pill-paid"}`}>
                  {c.role || "user"}
                </span>
              </div>
              <div className="admin-actions-right">
                <button
                  onClick={() => { setEditItem(c); setShowModal(true); }}
                  title="View"
                  className="admin-icon-btn"
                  type="button"
                ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>

                <button
                  onClick={() => handleDelete(c._id)}
                  title="Delete"
                  className="admin-icon-btn admin-icon-btn-danger"
                  type="button"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {!data.length ? <div className="admin-empty-state">No customers available.</div> : null}
        </div>
      </div>
    </div >
  );
}
