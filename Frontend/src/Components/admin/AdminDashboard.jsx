import { useEffect, useState } from "react";
import "../../Style/Admin.css";
import axios from "axios";
import { Link } from "lucide-react";

export default function AdminDashboard() {

  const [cusData, setcusData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);


  useEffect(() => {
    const fetch = async () => {
      let response = await axios("http://localhost:3000/customers/getcustomers");
      setcusData(response.data);
    }
    fetch();
  }, []);


  useEffect(() => {
    const fetch = async () => {
      let response = await axios("http://localhost:3000/orders/getorders");
      console.log(response.data)
      setOrdersData(response.data);
    }
    fetch();
  }, []);


  const kpis = [
    { label: "Revenue", value: "$12,480", delta: "+8.2%" },
    { label: "Orders", value: ordersData.length, delta: "+3.1%" },
    { label: "Customers", value: cusData.length, delta: "+5.6%" },
    { label: "Conversion", value: "2.9%", delta: "+0.4%" },
  ];

  return (
    <div className="admin-stack">
      <section className="admin-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="admin-card">
            <div className="admin-card-row">
              <div>
                <div className="admin-kpi-label">{k.label}</div>
                <div className="admin-kpi-value">{k.value}</div>
              </div>
              <div className="admin-kpi-delta">{k.delta}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-grid-2">
        <div className="admin-card admin-card-pad">
          <div className="admin-card-title">Recent Orders</div>
          <div className="admin-table">
            <div className="admin-table-head">
              <div>Order</div>
              <div>Phone</div>
              <div className="justify-center flex">Status</div>
              <div className="admin-right">Total</div>
            </div>
            {ordersData.slice(0, 6).map((o) => (
              <div key={o._id} className="admin-table-row">
                <div className="admin-mono">#{o._id.slice(-7).toUpperCase()}</div>
                <div className="font-bold">+{o.Phone}</div>
                    <span style={{
            padding: "6px 16px", borderRadius: "20px", fontSize: "12px",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
            background: "#ecfdf5", color: "#059669",
            border: `1.5px solid #a7f3d0`,
          }} className="flex justify-center">
            ● {o.Status}
          </span>


                <div className="flex justify-end font-bold">Rs./ {o.Total}</div>
                {/* <div> 
                  <span className={`admin-pill admin-pill-${o.status.toLowerCase()}`}
                  >
                    {o.status}
                  </span>
                </div>
                <div className="admin-right admin-strong">{o.total}</div> */}
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card admin-card-pad">

          <div className="admin-card-title">Quick Actions</div>
          <div className="admin-actions-grid">
            <button className="admin-action" type="button" onClick={()=>{ window.location.href="/admin/discounts";}}>
              <div className="admin-action-title">Create Discount</div>
              <div className="admin-action-sub">Boost sales with promo codes</div>
            </button>
            <button className="admin-action" type="button" onClick={()=>{window.location.href="/admin/products";}}>
              <div className="admin-action-title">View Low Stock</div>
              <div className="admin-action-sub">Restock before items run out</div>
            </button>
            <button className="admin-action" type="button" onClick={()=>{window.location.href = "/admin/orders";}}>
              <div className="admin-action-title">Export Orders</div>
              <div className="admin-action-sub">Download last 30 days report</div>
            </button>
            <button className="admin-action" type="button" onClick={()=>{ window.location.href = "/admin/customers";}}>
              <div className="admin-action-title">Manage Users</div>
              <div className="admin-action-sub">Control admin access permissions</div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
