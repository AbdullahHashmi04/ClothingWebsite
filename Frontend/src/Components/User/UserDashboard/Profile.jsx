import { useContext, useEffect, useState } from "react";
import CartContext from "../../Context/CartContext";
import { C, Badge, Card, SectionTitle, Btn } from "./shared";
import axios from "axios";

const BACKEND_URI = (
  globalThis.process?.env?.VITE_BACKEND_URI ||
  import.meta.env.VITE_BACKEND_URI ||
  import.meta.env.VITE_BACKEND_URL ||
  ""
).replace(/\/+$/, "");

export default function UserProfile() {
  const [editing, setEditing] = useState(false);
  const { user } = useContext(CartContext);
  const [initials, setInitials] = useState(user.Username ? user.Username.slice(0,1).toUpperCase() : "U");
  const [form, setForm] = useState({ Username: user.Username, Email: user.Email, Phone: user.Phone || "+92-XXXXXXXXX", Gender: user.Gender || "Male" });


  const onsubmit = async (form) => {
    try {
      console.log("Submitting:", user._id);
      const res = await axios.put(`${BACKEND_URI}/customers/updatecustomer/${user._id}`, form, {
        headers: { "Content-Type": "application/json" }
      });
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  }


const onChange = (e) => {
  setForm(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};



  const Field = ({ label, k, type  }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {editing ? (
        <input
          type={type} 
          name={k}
          value={form[k] || ""}
          onChange={onChange}
          style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.brand}`, fontSize: 14, color: C.text, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
        />
      ) : (
        <div style={{ padding: "10px 0", fontSize: 14, fontWeight: 500, color: C.text, borderBottom: `1px solid ${C.borderLight}` }}>{form[k]}</div>
      )}
    </div>  
  );

  return (
    <Card>
      <SectionTitle action={<Btn
  variant={editing ? "primary" : "ghost"}
  small
  onClick={() => {
    if (editing) {
      onsubmit(form);
    }
    setEditing(!editing);
  }}
>
  {editing ? "💾 Save" : "✏️ Edit"}
</Btn>}>
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

        </div>
        {editing && <Btn variant="outline" small style={{ marginLeft: "auto" }}>📷 Change Photo</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" }}>
        {Field({ label: "Username", k: "Username", type: "text" })}
        {Field({ label: "Email", k: "Email", type: "email" })}
        {Field({ label: "Phone", k: "Phone", type: "tel" })}
        {/* {Field({ label: "Gender", k: "Gender", type: "text" })} */}
      </div>
    </Card>
  );
}
