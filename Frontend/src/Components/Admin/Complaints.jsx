import { useState, useEffect } from "react";
import "../../Style/Admin.css";
import axios from "axios";

function ComplaintDetailsModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card admin-modal-card-sm">
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title">Complaint Details</h2>
            <p className="admin-modal-subtitle">Ticket #{String(data._id || "").slice(0, 12).toUpperCase() || "N/A"}</p>
          </div>
          <button className="admin-modal-close" onClick={onClose} type="button" aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-detail-list">
            <div className="admin-detail-item admin-detail-item-soft">
              <div>
                <div className="admin-detail-label">Customer Email</div>
                <div className="admin-detail-value admin-text-wrap">{data.email || "No email"}</div>
              </div>
            </div>
            <div className="admin-detail-item">
              <div>
                <div className="admin-detail-label">Subject</div>
                <div className="admin-detail-value admin-text-wrap">{data.subject || "No subject"}</div>
              </div>
            </div>
            <div className="admin-detail-item admin-detail-item-soft">
              <div>
                <div className="admin-detail-label">Complaint</div>
                <div className="admin-detail-value admin-text-wrap">{data.description || "No complaint text"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminComplaints() {
    const [data, setData] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                let response = await axios.get("http://localhost:3000/Complaints");
                setData(response.data);
            } catch (error) {
                console.error("Error fetching complaints:", error);
            }
        };
        fetchComplaints();
    }, []);


    const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/Complaints/${id}`);
      setData(data.filter((entry) => entry._id !== id));
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
    };

  const uniqueCustomers = new Set(data.map((entry) => entry.email).filter(Boolean)).size;
  const longComplaints = data.filter((entry) => String(entry.description || "").length > 140).length;

    return (
        <div className="admin-stack">
      {selectedComplaint ? <ComplaintDetailsModal data={selectedComplaint} onClose={() => setSelectedComplaint(null)} /> : null}

      <section className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Issue Resolution</p>
          <h2 className="admin-page-title">Complaints</h2>
          <p className="admin-page-subtitle">Track user-reported problems and review full ticket details before taking action.</p>
        </div>
      </section>

      <section className="admin-summary-strip">
        <article className="admin-summary-item">
          <div className="admin-summary-label">Total Tickets</div>
          <div className="admin-summary-value">{data.length}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Unique Customers</div>
          <div className="admin-summary-value">{uniqueCustomers}</div>
        </article>
        <article className="admin-summary-item">
          <div className="admin-summary-label">Detailed Reports</div>
          <div className="admin-summary-value">{longComplaints}</div>
        </article>
      </section>

            <div className="admin-card admin-card-pad">
                <div className="admin-card-row">
                    <div>
            <div className="admin-card-title">Complaint Tickets</div>
            <div className="admin-muted">Open ticket details, then keep or remove problematic entries.</div>
                    </div>
                </div>

                <div className="admin-table admin-mt">
          <div className="admin-table-head admin-table-head-complaints">
                        <div>ID</div>
                        <div>Email</div>
                        <div>Subject</div>
                        <div>Complaint</div>
            <div className="admin-right">Actions</div>
                    </div>
                    {data.map((f) => (
            <div key={f._id} className="admin-table-row admin-table-row-complaints">
              <div className="admin-mono">#{String(f._id || "").slice(0, 7).toUpperCase() || "N/A"}</div>
                            <div className="admin-muted">{f.email}</div>
              <div className="admin-muted admin-message-preview">{f.subject || "No subject"}</div>
              <div className="admin-muted admin-message-preview">{f.description || "No complaint text"}</div>
              <div className="admin-actions-right">
                <button
                  className="admin-icon-btn"
                  type="button"
                  title="View details"
                  onClick={() => setSelectedComplaint(f)}
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
                  onClick={() => handleDelete(f._id)}
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
                    ))}
                    {data.length === 0 && (
            <div className="admin-empty-state">No complaints available.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
