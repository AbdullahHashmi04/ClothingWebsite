import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../Style/Admin.css";
const BACKEND_URI = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URI )

const getStatusClass = (status) => {
  const key = String(status || "pending").toLowerCase();
  if (["paid", "delivered", "completed"].includes(key)) return "admin-pill-paid";
  if (["processing", "confirmed"].includes(key)) return "admin-pill-processing";
  if (["shipped"].includes(key)) return "admin-pill-shipped";
  if (["cancelled", "canceled", "failed"].includes(key)) return "admin-pill-danger";
  return "admin-pill-warn";
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function AdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [customersResponse, ordersResponse] = await Promise.all([
          axios(`${BACKEND_URI}/customers/getcustomers`),
          axios(`${BACKEND_URI}/orders/getorders`),
        ]);
        setCustomers(customersResponse.data || []);
        setOrders(ordersResponse.data || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.Total || 0), 0),
    [orders]
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => String(order.Status || "").toLowerCase() === "pending").length,
    [orders]
  );

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);
  const recentCustomers = useMemo(() => customers.slice(0, 5), [customers]);

  const kpis = [
    { label: "Revenue", value: formatCurrency(totalRevenue), delta: `${orders.length} orders` },
    { label: "Orders", value: orders.length, delta: `${pendingOrders} pending` },
    { label: "Customers", value: customers.length, delta: "Active buyers" },
    {
      label: "Avg Order",
      value: formatCurrency(orders.length ? totalRevenue / orders.length : 0),
      delta: "Per checkout",
    },
  ];

  return (
    <div className="admin-stack">
      <section className="admin-overview-hero">
        <div>
          <p className="admin-page-kicker">Operations Center</p>
          <h2 className="admin-overview-title">Store Pulse Dashboard</h2>
          <p className="admin-overview-text">
            Monitor sales momentum, order activity, and customer growth from one clean control room.
          </p>
        </div>
        <div className="admin-overview-cta">
          <button className="admin-primary-btn" type="button" onClick={() => { window.location.href = "/admin/orders"; }}>
            Review Orders
          </button>
          <button className="admin-secondary-btn" type="button" onClick={() => { window.location.href = "/admin/products"; }}>
            Manage Catalog
          </button>
        </div>
      </section>

      <section className="admin-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="admin-card admin-card-pad admin-kpi-card">
            <div className="admin-kpi-label">{kpi.label}</div>
            <div className="admin-kpi-value">{kpi.value}</div>
            <div className="admin-kpi-delta admin-kpi-neutral">{kpi.delta}</div>
          </div>
        ))}
      </section>

      <section className="admin-grid-2">
        <div className="admin-card admin-card-pad">
          <div className="admin-card-row">
            <div>
              <div className="admin-card-title">Recent Orders</div>
              <div className="admin-muted">Latest checkouts with customer and payment status.</div>
            </div>
          </div>

          <div className="admin-table admin-mt">
            <div className="admin-table-head admin-table-head-dashboard">
              <div>Order</div>
              <div>Customer</div>
              <div>Status</div>
              <div className="admin-right">Total</div>
            </div>

            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div key={order._id} className="admin-table-row admin-table-row-dashboard">
                  <div className="admin-mono">#{String(order._id || "").slice(-7).toUpperCase() || "N/A"}</div>
                  <div>
                    <div className="admin-strong">{order.FullName || "Unknown"}</div>
                    <div className="admin-muted">+{order.Phone || "N/A"}</div>
                  </div>
                  <div>
                    <span className={`admin-pill ${getStatusClass(order.Status)}`}>
                      {order.Status || "Pending"}
                    </span>
                  </div>
                  <div className="admin-right admin-strong">{formatCurrency(order.Total)}</div>
                </div>
              ))
            ) : (
              <div className="admin-empty-state">No orders found yet.</div>
            )}
          </div>
        </div>

        <div className="admin-stack">
          <div className="admin-card admin-card-pad">
            <div className="admin-card-title">Quick Actions</div>
            <div className="admin-actions-grid">
              <button className="admin-action" type="button" onClick={() => { window.location.href = "/admin/discounts"; }}>
                <div className="admin-action-title">Create Discount</div>
                <div className="admin-action-sub">Launch a promo campaign</div>
              </button>
              <button className="admin-action" type="button" onClick={() => { window.location.href = "/admin/products"; }}>
                <div className="admin-action-title">Check Inventory</div>
                <div className="admin-action-sub">Spot low-stock products</div>
              </button>
              <button className="admin-action" type="button" onClick={() => { window.location.href = "/admin/customers"; }}>
                <div className="admin-action-title">Customer Profiles</div>
                <div className="admin-action-sub">Review buyer details quickly</div>
              </button>
              <button className="admin-action" type="button" onClick={() => { window.location.href = "/admin/feedback"; }}>
                <div className="admin-action-title">Read Feedback</div>
                <div className="admin-action-sub">Track service quality trends</div>
              </button>
            </div>
          </div>

          <div className="admin-card admin-card-pad">
            <div className="admin-card-title">New Customers</div>
            <div className="admin-list-compact">
              {recentCustomers.length ? (
                recentCustomers.map((customer) => (
                  <div key={customer._id} className="admin-list-item">
                    <div className="admin-avatar-sm">{String(customer.Username || "U").slice(0, 1).toUpperCase()}</div>
                    <div>
                      <div className="admin-strong">{customer.Username || "Unknown User"}</div>
                      <div className="admin-muted">{customer.Email || "No email"}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-empty-state">No customer entries available.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
