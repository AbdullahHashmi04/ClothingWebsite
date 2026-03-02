import { useState } from "react";
import { C, Card, SectionTitle, Btn } from "./shared";

export default function UserCheckout() {
  const [saved, setSaved] = useState({ card: true, upi: false, wallet: true });
  return (
    <Card>
      <SectionTitle>⚡ Faster Checkout</SectionTitle>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>Saved payment methods for one-tap checkout.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {[
          { key: "card", icon: "💳", label: "Visa ending in ••4892", sub: "Expires 08/27" },
          { key: "upi", icon: "📲", label: "UPI: naeem@okhdfc", sub: "Linked to HDFC Bank" },
          { key: "wallet", icon: "👜", label: "Store Wallet: $24.50", sub: "Available balance" },
        ].map(m => (
          <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: `1.5px solid ${saved[m.key] ? C.brand : C.border}`, borderRadius: 12, background: saved[m.key] ? C.brandLight : "#fff", transition: "all 0.15s" }}>
            <div style={{ fontSize: 22 }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{m.label}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{m.sub}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ position: "relative", width: 40, height: 22, cursor: "pointer" }}>
                <input type="checkbox" checked={saved[m.key]} onChange={() => setSaved({ ...saved, [m.key]: !saved[m.key] })} style={{ opacity: 0, width: 0, height: 0 }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: 11, background: saved[m.key] ? C.brand : C.border, transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: 3, left: saved[m.key] ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
      <Btn variant="outline" small>+ Add New Payment Method</Btn>

      {/* Security note */}
      <div style={{ marginTop: 18, padding: "12px 14px", background: C.successLight, borderRadius: 10, fontSize: 12, color: C.success, display: "flex", gap: 8, alignItems: "center" }}>
        <span>🔒</span>
        <span>All payment info is encrypted and secured with 256-bit SSL.</span>
      </div>
    </Card>
  );
}
