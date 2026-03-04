import { useState, useEffect } from "react";
import "../../Style/Admin.css";
import axios from "axios";

export default function AdminComplaints() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                let response = await axios.get("http://localhost:3000/Complaints");
                console.log("Fetched complaints:", response.data);  
                setData(response.data);
            } catch (error) {
                console.error("Error fetching complaints:", error);
            }
        };
        fetchComplaints();
    }, []);


    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/Complaints/${id}`);
        setData(data.filter((o) => o._id !== id));
    };
    return (
        <div className="admin-stack">
            <div className="admin-card admin-card-pad">
                <div className="admin-card-row">
                    <div>
                        <div className="admin-card-title">Customer Complaints</div>
                        <div className="admin-muted">Review complaints and issues raised by users.</div>
                    </div>
                </div>

                <div className="admin-table admin-mt">
                    <div className="admin-table-head" style={{ gridTemplateColumns: "1fr 1fr 2fr 3fr 3fr" }}>
                        <div>ID</div>
                        <div>Email</div>
                        <div>Subject</div>
                        <div>Complaint</div>
                        <div >Actions</div>
                    </div>
                    {data.map((f) => (
                        <div key={f._id} className="admin-table-row" style={{ gridTemplateColumns: "1fr 1fr 2fr 3fr 3fr" }}>
                            <div className="admin-mono">#{f._id.slice(0, 7).toUpperCase()}</div>
                            <div className="admin-muted">{f.email}</div>
                            <div className="admin-muted" style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{f.subject}</div>
                            <div className="admin-muted" style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{f.description}</div>
                            <div className="admin-table-actions">
                                 <div className="flex gap-2">
                  {/* View Details */}
                  {/* <button
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
                  </button> */}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(f._id)}
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
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                            No complaints available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
