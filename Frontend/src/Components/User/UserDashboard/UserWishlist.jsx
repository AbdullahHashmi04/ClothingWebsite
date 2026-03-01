import { useState } from "react";
import { C, Card, SectionTitle, Btn } from "./shared";
import { useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import  CartContext  from "../../Context/CartContext";

export default function UserWishlist() {
  const [items, setItems] = useState([]);
  const remove = (id) => setItems(items.filter(i => i.id !== id));
  const {user} = useContext(CartContext)


  useEffect(() => {

    const fetch = async () => {
      console.log("Email is ",user.Email)
      const res = await axios.get(`http://localhost:3000/wishlist/${user.Email}`)
      console.log(res.data)
      setItems(res.data)
    }

    fetch()

  },[])



  return (
    <Card>
      <SectionTitle><span>❤️ Wishlist <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>({items.length} items)</span></span></SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {items.map(item => (
          <div key={item.id} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px", position: "relative", background: item.stock ? "#fff" : "#fafafa" }}>
            <button onClick={() => remove(item.id)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.muted, lineHeight: 1 }}>×</button>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{item.img}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>{item.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.brand }}>{item.price}</span>
              {item.oldPrice && <span style={{ fontSize: 12, color: C.muted, textDecoration: "line-through" }}>{item.oldPrice}</span>}
            </div>
            {item.stock
              ? <Btn variant="primary" small style={{ width: "100%", justifyContent: "center" }}>🛒 Add to Cart</Btn>
              : <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textAlign: "center", padding: "6px 0" }}>Out of Stock — Notify Me</div>
            }
          </div>
        ))}
      </div>
    </Card>
  );
}
