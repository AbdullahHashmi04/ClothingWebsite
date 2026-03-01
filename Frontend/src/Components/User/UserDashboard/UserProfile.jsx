import { useContext, useState } from "react";
import CartContext from "../../Context/CartContext";
import { C, Badge, Card, SectionTitle, Btn } from "./shared";

export default function UserProfile() {
  const [editing, setEditing] = useState(false);
  const { user } = useContext(CartContext);
  const [form, setForm] = useState({ Username: user.Username, email: user.Email, phone: user.Phone || "+92-XXXXXXXXX",gender: "Male" });

  const Field = ({ label, k, type = "text" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {editing ? (
        <input
          type={type} value={form[k]}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.brand}`, fontSize: 14, color: C.text, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
        />
      ) : (
        <div style={{ padding: "10px 0", fontSize: 14, fontWeight: 500, color: C.text, borderBottom: `1px solid ${C.borderLight}` }}>{form[k]}</div>
      )}
    </div>
  );
  const initials = user.Username.slice(0,2).toUpperCase();

  return (
    <Card>
      <SectionTitle action={<Btn variant={editing ? "primary" : "ghost"} small onClick={() => setEditing(!editing)}>{editing ? "✓ Save" : "✏️ Edit"}</Btn>}>
        My Profile
      </SectionTitle>

      {/* Avatar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, padding: "18px 20px", background: C.brandLight, borderRadius: 14 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.brand}, ${C.brandMid})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'Sora',sans-serif",
          boxShadow: `0 4px 16px rgba(124,58,237,0.35)`,
          flexShrink: 0,
        }}> {user.picture ? <img src={user.picture} alt={user.Username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>{initials}</div>}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: C.text, fontFamily: "'Sora',sans-serif" }}>{user.Username}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Badge label="Gold Member" bg={C.accentLight} color={C.accent} />
            <Badge label="Verified ✓" bg={C.successLight} color={C.success} />
          </div>
        </div>
        {editing && <Btn variant="outline" small style={{ marginLeft: "auto" }}>📷 Change Photo</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" }}>
        <Field label="Username" k="Username" />
        <Field label="Email" k="email" type="email" />
        <Field label="Phone" k="phone" type="tel" />
        <Field label="Gender" k="gender" />
      </div>
    </Card>
  );
}
