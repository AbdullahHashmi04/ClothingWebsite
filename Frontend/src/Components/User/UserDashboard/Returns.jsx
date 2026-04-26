import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { C, Card, SectionTitle, Btn } from "./shared";
import CartContext from "../../Context/CartContext";

const BACKEND_URI = (
  globalThis.process?.env?.VITE_BACKEND_URI ||
  import.meta.env.VITE_BACKEND_URI ||
  import.meta.env.VITE_BACKEND_URL ||
  ""
).replace(/\/+$/, "");

export default function UserReturns() {
  const { user } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [tab, setTab] = useState("cancel"); // "cancel" | "complaint" | "history"
  const [selected, setSelected] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Complaint form
  const [complaintOrder, setComplaintOrder] = useState(null);
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [complaintError, setComplaintError] = useState("");

  const subjects = [
    "Defective / Damaged item",
    "Wrong item received",
    "Item not as described",
    "Late delivery",
    "Missing items in order",
    "Other",
  ];

  // ── Fetch orders & complaints ──
  useEffect(() => {
    if (!user?.Email) return;
    const token = localStorage.getItem("token");
    Promise.all([
      axios.get(`${BACKEND_URI}/orders/getUserOrders/${user.Email}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BACKEND_URI}/complaints/${user.Email}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: [] })),
    ])
      .then(([ordersRes, complaintsRes]) => {
        setOrders(ordersRes.data);
        setComplaints(complaintsRes.data);
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, [user]);

  // ── Helpers ──
  const hoursRemaining = (dateStr) => {
    const placed = new Date(dateStr);
    const diff = 24 - (Date.now() - placed) / (1000 * 60 * 60);
    return diff;
  };

  const cancellableOrders = orders.filter(
    (o) => o.Status !== "Cancelled" && hoursRemaining(o.date) > 0
  );
  const cancelledOrders = orders.filter((o) => o.Status === "Cancelled");

  // ── Cancel handler ──
  const handleCancel = async () => {
    try {
      setCancelError("");
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URI}/orders/cancel/${selected._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === selected._id ? { ...o, Status: "Cancelled" } : o))
      );
      setCancelSuccess(true);
      setCancelConfirm(false);
    } catch (err) {
      setCancelError(err.response?.data?.error || "Failed to cancel order");
    }
  };

  // ── Complaint handler ──
  const handleComplaint = async () => {
    try {
      setComplaintError("");
      if (!complaintSubject || !complaintDesc.trim()) {
        setComplaintError("Please fill in all fields");
        return;
      }
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BACKEND_URI}/complaints`,
        {
          orderId: complaintOrder._id,
          email: user.Email,
          subject: complaintSubject,
          description: complaintDesc,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints((prev) => [res.data.complaint, ...prev]);
      setComplaintSuccess(true);
    } catch (err) {
      setComplaintError(err.response?.data?.error || "Failed to file complaint");
    }
  };

  // ── Shared styles ──
  const tabStyle = (active) => ({
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "'DM Sans',sans-serif",
    background: active ? C.brand : C.brandLight,
    color: active ? "#fff" : C.brand,
    transition: "all 0.15s",
  });

  const cardRow = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    border: `1.5px solid ${C.border}`,
    borderRadius: 12,
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const label = {
    fontSize: 12,
    fontWeight: 600,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: 8,
  };

  if (loading)
    return (
      <Card>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          <div style={{ color: C.muted, fontSize: 14 }}>Loading your orders…</div>
        </div>
      </Card>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Tab bar ── */}
      <Card>
        <SectionTitle>Returns & Refunds</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={tabStyle(tab === "cancel")} onClick={() => { setTab("cancel"); setSelected(null); setCancelSuccess(false); setCancelError(""); }}>
            🚫 Cancel Order
          </button>
          <button style={tabStyle(tab === "complaint")} onClick={() => { setTab("complaint"); setComplaintOrder(null); setComplaintSuccess(false); setComplaintError(""); }}>
            📝 File Complaint
          </button>
          <button style={tabStyle(tab === "history")} onClick={() => setTab("history")}>
            📋 History
          </button>
        </div>
      </Card>

      {/* ══════════════════════════════════════════
           TAB 1 — Cancel Order (within 24 hours)
         ══════════════════════════════════════════ */}
      {tab === "cancel" && (
        <Card>
          <SectionTitle>Cancel an Order</SectionTitle>

          {/* Success message */}
          {cancelSuccess && (
            <div style={{ textAlign: "center", padding: "28px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: C.text, fontFamily: "'Sora',sans-serif" }}>
                Order Cancelled Successfully!
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6, marginBottom: 18 }}>
                Your refund will be processed within 3–5 business days.
              </div>
              <Btn variant="ghost" onClick={() => { setCancelSuccess(false); setSelected(null); }}>
                Done
              </Btn>
            </div>
          )}

          {/* Order list */}
          {!cancelSuccess && !selected && (
            <>
              <p style={{ fontSize: 14, color: C.muted, margin: "0 0 16px" }}>
                You can cancel an order within <strong>24 hours</strong> of placing it.
              </p>

              {cancellableOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  No orders eligible for cancellation right now.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cancellableOrders.map((order) => {
                    const hrs = Math.max(0, hoursRemaining(order.date));
                    return (
                      <div
                        key={order._id}
                        onClick={() => { setSelected(order); setCancelConfirm(false); setCancelError(""); }}
                        style={cardRow}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.boxShadow = "0 2px 12px rgba(124,58,237,0.10)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div style={{ fontSize: 22 }}>📦</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
                            Order #{order._id.slice(-8).toUpperCase()}
                          </div>
                          <div style={{ fontSize: 12, color: C.muted }}>
                            {new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            {" · "}
                            {order.cart?.length} item{order.cart?.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>Rs. {order.Total?.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: hrs < 6 ? C.danger : C.success, fontWeight: 600 }}>
                            ⏰ {hrs.toFixed(1)}h left
                          </div>
                        </div>
                        <span style={{ color: C.brand, fontSize: 18 }}>→</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Order detail + cancel confirm */}
          {!cancelSuccess && selected && (
            <>
              <div style={{ padding: "14px 16px", background: C.brandLight, borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>📦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                    Order #{selected._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    Placed {new Date(selected.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Rs. {selected.Total?.toLocaleString()}</div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={label}>Items in this order</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selected.cart?.map((item, i) => (
                    <div key={item._id || i} style={{ fontSize: 13, color: C.text, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, border: `1px solid ${C.border}` }}>
                      {i + 1}. {item.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time remaining */}
              <div style={{ padding: "10px 14px", background: "#FEF3C7", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#92400E" }}>
                ⏰ You have <strong>{Math.max(0, hoursRemaining(selected.date)).toFixed(1)} hours</strong> remaining to cancel this order.
              </div>

              {cancelError && (
                <div style={{ padding: "10px 14px", background: C.dangerLight, borderRadius: 10, marginBottom: 12, fontSize: 13, color: C.danger, fontWeight: 600 }}>
                  {cancelError}
                </div>
              )}

              {!cancelConfirm ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="ghost" onClick={() => setSelected(null)} small>← Back</Btn>
                  <Btn variant="danger" onClick={() => setCancelConfirm(true)} small>Cancel This Order</Btn>
                </div>
              ) : (
                <div style={{ padding: 16, border: `2px solid ${C.danger}`, borderRadius: 12, background: C.dangerLight }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.danger, marginBottom: 8 }}>
                    ⚠️ Are you sure you want to cancel this order?
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
                    This action cannot be undone. A refund will be initiated within 3–5 business days.
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn variant="ghost" onClick={() => setCancelConfirm(false)} small>No, Keep Order</Btn>
                    <Btn variant="danger" onClick={handleCancel} small>Yes, Cancel Order</Btn>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* ══════════════════════════════════════════
           TAB 2 — File a Complaint
         ══════════════════════════════════════════ */}
      {tab === "complaint" && (
        <Card>
          <SectionTitle>File a Complaint</SectionTitle>

          {complaintSuccess ? (
            <div style={{ textAlign: "center", padding: "28px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📩</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: C.text, fontFamily: "'Sora',sans-serif" }}>
                Complaint Filed Successfully!
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6, marginBottom: 18 }}>
                Our team will review your complaint and get back to you shortly.
              </div>
              <Btn variant="ghost" onClick={() => { setComplaintSuccess(false); setComplaintOrder(null); setComplaintSubject(""); setComplaintDesc(""); }}>
                File Another
              </Btn>
            </div>
          ) : !complaintOrder ? (
            <>
              <p style={{ fontSize: 14, color: C.muted, margin: "0 0 16px" }}>
                Select the order you want to file a complaint about.
              </p>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  No orders found.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => setComplaintOrder(order)}
                      style={cardRow}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.brand; e.currentTarget.style.boxShadow = "0 2px 12px rgba(124,58,237,0.10)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{ fontSize: 22 }}>📦</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>
                          {new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          {" · "}
                          {order.cart?.length} item{order.cart?.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                        background: order.Status === "Cancelled" ? C.dangerLight : order.Status === "paid" ? C.successLight : C.accentLight,
                        color: order.Status === "Cancelled" ? C.danger : order.Status === "paid" ? C.success : C.accent,
                      }}>
                        {order.Status}
                      </span>
                      <span style={{ color: C.brand, fontSize: 18 }}>→</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected order header */}
              <div style={{ padding: "14px 16px", background: C.brandLight, borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>📦</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                    Order #{complaintOrder._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {new Date(complaintOrder.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Rs. {complaintOrder.Total?.toLocaleString()}</div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 16 }}>
                <div style={label}>What is your complaint about?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {subjects.map((s) => (
                    <label
                      key={s}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                        padding: "10px 14px", borderRadius: 10,
                        border: `1.5px solid ${complaintSubject === s ? C.brand : C.border}`,
                        background: complaintSubject === s ? C.brandLight : "#fff",
                        transition: "all 0.15s",
                      }}
                    >
                      <input type="radio" name="subject" checked={complaintSubject === s} onChange={() => setComplaintSubject(s)} style={{ accentColor: C.brand }} />
                      <span style={{ fontSize: 14, color: C.text }}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <div style={label}>Describe the issue</div>
                <textarea
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Please provide details about the issue you experienced…"
                  rows={4}
                  style={{
                    width: "100%", padding: "12px 14px", fontSize: 14, borderRadius: 10,
                    border: `1.5px solid ${C.border}`, fontFamily: "'DM Sans',sans-serif",
                    resize: "vertical", outline: "none", transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.brand)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>

              {complaintError && (
                <div style={{ padding: "10px 14px", background: C.dangerLight, borderRadius: 10, marginBottom: 12, fontSize: 13, color: C.danger, fontWeight: 600 }}>
                  {complaintError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="ghost" onClick={() => { setComplaintOrder(null); setComplaintSubject(""); setComplaintDesc(""); setComplaintError(""); }} small>← Back</Btn>
                <Btn variant="primary" onClick={handleComplaint} small disabled={!complaintSubject || !complaintDesc.trim()}>
                  Submit Complaint
                </Btn>
              </div>
            </>
          )}
        </Card>
      )}

      {/* ══════════════════════════════════════════
           TAB 3 — History
         ══════════════════════════════════════════ */}
      {tab === "history" && (
        <Card>
          <SectionTitle>Cancellation & Complaint History</SectionTitle>

          {/* Cancelled orders */}
          <div style={{ marginBottom: 24 }}>
            <div style={label}>Cancelled Orders</div>
            {cancelledOrders.length === 0 ? (
              <div style={{ fontSize: 13, color: C.muted, padding: "12px 0" }}>No cancelled orders.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cancelledOrders.map((order) => (
                  <div key={order._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.dangerLight, borderRadius: 10 }}>
                    <div style={{ fontSize: 20 }}>🚫</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
                        Order #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        {new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: C.danger, fontSize: 13 }}>Rs. {order.Total?.toLocaleString()}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: C.dangerLight, color: C.danger }}>
                      Cancelled
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complaints */}
          <div>
            <div style={label}>Filed Complaints</div>
            {complaints.length === 0 ? (
              <div style={{ fontSize: 13, color: C.muted, padding: "12px 0" }}>No complaints filed yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {complaints.map((c) => (
                  <div key={c._id} style={{ padding: "14px 16px", border: `1.5px solid ${C.border}`, borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{c.subject}</div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                        background: c.status === "Resolved" ? C.successLight : c.status === "In Progress" ? C.accentLight : C.brandLight,
                        color: c.status === "Resolved" ? C.success : c.status === "In Progress" ? C.accent : C.brand,
                      }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{c.description}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      Order #{c.orderId?.toString().slice(-8).toUpperCase()} · Filed {new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
