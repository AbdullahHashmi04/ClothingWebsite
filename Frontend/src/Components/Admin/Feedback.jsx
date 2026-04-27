import { useState, useEffect } from "react";
import "../../Style/Admin.css";
import axios from "axios";

const BACKEND_URI = (import.meta.env.VITE_BACKEND_URI || import.meta.env.VITE_BACKEND_URL)


function FeedbackDetailsModal({ data, onClose }) {
    if (!data) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-card admin-modal-card-sm">
                <div className="admin-modal-header">
                    <div>
                        <h2 className="admin-modal-title">Feedback Details</h2>
                        <p className="admin-modal-subtitle">Entry #{String(data._id || "").slice(0, 12).toUpperCase() || "N/A"}</p>
                    </div>
                    <button className="admin-modal-close" onClick={onClose} type="button" aria-label="Close modal">
                        ×
                    </button>
                </div>

                <div className="admin-modal-body">
                    <div className="admin-detail-list">
                        <div className="admin-detail-item admin-detail-item-soft">
                            <div>
                                <div className="admin-detail-label">Name</div>
                                <div className="admin-detail-value">{data.name || "Unknown"}</div>
                            </div>
                        </div>
                        <div className="admin-detail-item">
                            <div>
                                <div className="admin-detail-label">Email</div>
                                <div className="admin-detail-value">{data.email || "No email"}</div>
                            </div>
                        </div>
                        <div className="admin-detail-item admin-detail-item-soft">
                            <div>
                                <div className="admin-detail-label">Message</div>
                                <div className="admin-detail-value admin-text-wrap">{data.message || "No message"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminFeedback() {
    const [data, setData] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                let response = await axios(`${BACKEND_URI}/Feedback`);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            }
        };
        fetchFeedback();
    }, []);

    const uniqueSenders = new Set(data.map((entry) => entry.email).filter(Boolean)).size;
    const longFeedback = data.filter((entry) => String(entry.message || "").length > 120).length;

    return (
        <div className="admin-stack">
            {selectedFeedback ? <FeedbackDetailsModal data={selectedFeedback} onClose={() => setSelectedFeedback(null)} /> : null}

            <section className="admin-page-header">
                <div>
                    <p className="admin-page-kicker">Voice Of Customer</p>
                    <h2 className="admin-page-title">Feedback</h2>
                    <p className="admin-page-subtitle">Review user thoughts, detect recurring praise, and identify product pain points quickly.</p>
                </div>
            </section>

            <section className="admin-summary-strip">
                <article className="admin-summary-item">
                    <div className="admin-summary-label">Total Feedback</div>
                    <div className="admin-summary-value">{data.length}</div>
                </article>
                <article className="admin-summary-item">
                    <div className="admin-summary-label">Unique Senders</div>
                    <div className="admin-summary-value">{uniqueSenders}</div>
                </article>
                <article className="admin-summary-item">
                    <div className="admin-summary-label">Long Messages</div>
                    <div className="admin-summary-value">{longFeedback}</div>
                </article>
            </section>

            <div className="admin-card admin-card-pad">
                <div className="admin-card-row">
                    <div>
                        <div className="admin-card-title">Feedback Inbox</div>
                        <div className="admin-muted">Browse recent comments and open full details with one click.</div>
                    </div>
                </div>

                <div className="admin-table admin-mt">
                    <div className="admin-table-head admin-table-head-feedback">
                        <div>ID</div>
                        <div>Sender</div>
                        <div>Email</div>
                        <div>Message</div>
                        <div className="admin-right">Actions</div>
                    </div>
                    {data.map((f) => (
                        <div key={f._id} className="admin-table-row admin-table-row-feedback">
                            <div className="admin-mono">#{String(f._id || "").slice(0, 7).toUpperCase() || "N/A"}</div>
                            <div className="admin-strong">{f.name}</div>
                            <div className="admin-muted">{f.email}</div>
                            <div className="admin-muted admin-message-preview">{f.message || "No message"}</div>
                            <div className="admin-actions-right">
                                <button
                                    className="admin-icon-btn"
                                    type="button"
                                    title="View details"
                                    onClick={() => setSelectedFeedback(f)}
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
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="admin-empty-state">No feedback available.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
