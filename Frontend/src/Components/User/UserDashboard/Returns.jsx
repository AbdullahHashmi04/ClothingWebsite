import { useState } from "react";
import { C, Badge, Card, SectionTitle, Btn } from "./shared";

export default function UserReturns() {

  // ── Mock Data ──
 const ORDERS = [
  { id: "#A8F21C", date: "Feb 14, 2026", status: "Delivered", items: 3, total: "$124.00", product: "Wireless Headphones" },
  { id: "#B3D90E", date: "Feb 08, 2026", status: "Shipped", items: 1, total: "$89.99", product: "Mechanical Keyboard" },
  { id: "#C7E45A", date: "Jan 29, 2026", status: "Processing", items: 2, total: "$210.50", product: "Smart Watch + Strap" },
  { id: "#D1F033", date: "Jan 15, 2026", status: "Delivered", items: 1, total: "$44.00", product: "USB-C Hub" },
  { id: "#E9A22B", date: "Jan 03, 2026", status: "Returned", items: 1, total: "$79.00", product: "Bluetooth Speaker" },
];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const reasons = ["Item damaged", "Wrong item received", "Changed my mind", "Item not as described", "Other"];

  return (
    <Card>
      <SectionTitle>Returns & Refunds</SectionTitle>

      {step === 0 && (
        <>
          <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>Select a delivered order to initiate a return or refund request.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ORDERS.filter(o => o.status === "Delivered").map(order => (
              <div key={order.id} onClick={() => { setSelected(order); setStep(1); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: `1.5px solid ${C.border}`, borderRadius: 12, cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.brand}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ fontSize: 22 }}>📦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{order.product}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{order.id} · {order.date}</div>
                </div>
                <div style={{ fontWeight: 700, color: C.text }}>{order.total}</div>
                <span style={{ color: C.brand }}>→</span>
              </div>
            ))}
          </div>

          {/* Past returns */}
          <div style={{ marginTop: 24, padding: "16px", background: C.dangerLight, borderRadius: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.danger, marginBottom: 8 }}>Past Return · #E9A22B</div>
            <div style={{ fontSize: 13, color: C.text }}>Bluetooth Speaker — Refund of $79.00 processed on Jan 20, 2026</div>
            <Badge label="Refunded ✓" bg={C.successLight} color={C.success} style={{ marginTop: 8, display: "inline-flex" }} />
          </div>
        </>
      )}

      {step === 1 && selected && (
        <>
          <div style={{ padding: "12px 16px", background: C.brandLight, borderRadius: 10, marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📦</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{selected.product}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{selected.id} · {selected.total}</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Reason for return</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reasons.map(r => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${reason === r ? C.brand : C.border}`, background: reason === r ? C.brandLight : "#fff", transition: "all 0.15s" }}>
                  <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: C.brand }} />
                  <span style={{ fontSize: 14, color: C.text }}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(0)} small>← Back</Btn>
            <Btn variant="primary" onClick={() => setStep(2)} small disabled={!reason}>Submit Request</Btn>
          </div>
        </>
      )}

      {step === 2 && (
        <div style={{ textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.text, fontFamily: "'Sora',sans-serif" }}>Return Request Submitted!</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, marginBottom: 20 }}>We'll process your refund within 3–5 business days.</div>
          <Btn variant="ghost" onClick={() => { setStep(0); setSelected(null); setReason(""); }}>Start New Request</Btn>
        </div>
      )}
    </Card>
  );
}
