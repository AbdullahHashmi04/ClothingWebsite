import { useState, useEffect } from "react";
import "../../Style/Admin.css";
import axios from "axios";

export default function AdminFeedback() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                let response = await axios("http://localhost:3000/Feedback");
                setData(response.data);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            }
        };
        fetchFeedback();
    }, []);

    return (
        <div className="admin-stack">
            <div className="admin-card admin-card-pad">
                <div className="admin-card-row">
                    <div>
                        <div className="admin-card-title">Customer Feedback</div>
                        <div className="admin-muted">Review feedback and ratings left by users.</div>
                    </div>
                </div>

                <div className="admin-table admin-mt">
                    <div className="admin-table-head" style={{ gridTemplateColumns: "1fr 1fr 2fr 3fr" }}>
                        <div>ID</div>
                        <div>Name</div>
                        <div>Email</div>
                        <div>Message</div>
                    </div>
                    {data.map((f) => (
                        <div key={f._id} className="admin-table-row" style={{ gridTemplateColumns: "1fr 1fr 2fr 3fr" }}>
                            <div className="admin-mono">#{f._id.slice(0, 7)}</div>
                            <div className="admin-strong">{f.name}</div>
                            <div className="admin-muted">{f.email}</div>
                            <div className="admin-muted" style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{f.message}</div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                            No feedback available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
