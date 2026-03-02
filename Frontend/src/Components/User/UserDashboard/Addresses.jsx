import { useState } from "react";
import { C, ADDRESSES, Badge, Card, SectionTitle, Btn } from "./shared";

export default function UserAddresses() {
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <SectionTitle action={<Btn variant="ghost" small onClick={() => setAdding(!adding)}>{adding ? "✕ Cancel" : "+ Add Address"}</Btn>}>
        Addresses
      </SectionTitle>

      {adding && (
        <div style={{ padding: 18, background: C.brandLight, borderRadius: 12, marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {["Label", "Full Name", "Address Line 1", "City & ZIP", "Phone"].map(p => (
              <input key={p} placeholder={p} style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", gridColumn: p === "Address Line 1" ? "1 / -1" : undefined }} />
            ))}
          </div>
          <Btn variant="primary" small onClick={() => setAdding(false)}>Save Address</Btn>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {addresses.map(addr => (
          <div key={addr.id} style={{ padding: "16px", border: `1.5px solid ${addr.default ? C.brand : C.border}`, borderRadius: 14, background: addr.default ? C.brandLight : "#fff", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{addr.label}</span>
                  {addr.default && <Badge label="Default" bg={C.brand} color="#fff" />}
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{addr.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{addr.line1}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{addr.line2}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>📞 {addr.phone}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="ghost" small>✏️</Btn>
                {!addr.default && <Btn variant="danger" small onClick={() => setAddresses(addresses.filter(a => a.id !== addr.id))}>🗑</Btn>}
              </div>
            </div>
            {!addr.default && (
              <button onClick={() => setAddresses(addresses.map(a => ({ ...a, default: a.id === addr.id })))}
                style={{ marginTop: 10, fontSize: 12, color: C.brand, background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0, fontFamily: "'DM Sans',sans-serif" }}>
                Set as default →
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
