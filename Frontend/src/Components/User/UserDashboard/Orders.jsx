import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  FiTruck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiPackage,
  FiShoppingBag,
  FiXCircle,
  FiCreditCard,
} from "react-icons/fi";
import CartContext from "../../Context/CartContext";
import "../../../Style/UserOrders.css";

const BACKEND_URI = (
  globalThis.process?.env?.VITE_BACKEND_URI ||
  import.meta.env.VITE_BACKEND_URI ||
  import.meta.env.VITE_BACKEND_URL ||
  ""
).replace(/\/+$/, "");

const normalizeStatus = (status) => {
  const value = (status || "pending").toLowerCase();
  if (["paid", "processing", "shipped", "delivered", "cancelled", "pending"].includes(value)) {
    return value;
  }
  return "pending";
};

const getStatusConfig = (status) => {
  const normalizedStatus = normalizeStatus(status);
  const lookup = {
    paid: {
      label: "Paid",
      icon: <FiCheckCircle />,
      chipClass: "uo-status uo-status-paid",
    },
    pending: {
      label: "Pending",
      icon: <FiClock />,
      chipClass: "uo-status uo-status-pending",
    },
    processing: {
      label: "Processing",
      icon: <FiCreditCard />,
      chipClass: "uo-status uo-status-processing",
    },
    shipped: {
      label: "Shipped",
      icon: <FiTruck />,
      chipClass: "uo-status uo-status-shipped",
    },
    delivered: {
      label: "Delivered",
      icon: <FiCheckCircle />,
      chipClass: "uo-status uo-status-delivered",
    },
    cancelled: {
      label: "Cancelled",
      icon: <FiXCircle />,
      chipClass: "uo-status uo-status-cancelled",
    },
  };

  return lookup[normalizedStatus];
};

const getTrackingSteps = (status) => {
  const normalizedStatus = normalizeStatus(status);
  const completedMap = {
    pending: 1,
    paid: 2,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 1,
  };

  const completedSteps = completedMap[normalizedStatus] || 1;
  const steps = ["Order Placed", "Payment Confirmed", "Shipped", "Delivered"];

  return steps.map((title, index) => {
    const stepIndex = index + 1;
    let state = "upcoming";

    if (stepIndex < completedSteps) state = "complete";
    if (stepIndex === completedSteps) state = normalizedStatus === "delivered" ? "complete" : "current";

    if (normalizedStatus === "cancelled" && stepIndex > 1) {
      state = "upcoming";
    }

    return { title, state };
  });
};

const UserOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(CartContext);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.Email) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BACKEND_URI}/orders/getUserOrders/${user.Email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.Email]);

  const orderStats = {
    totalOrders: orders.length,
    totalItems: orders.reduce((sum, order) => sum + (order.cart?.length || 0), 0),
    totalSpend: orders.reduce((sum, order) => sum + (Number(order.Total) || 0), 0),
  };

  if (loading) {
    return (
      <div className="uo-loading-wrap">
        <div className="uo-loading-card">
          <div className="uo-spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="uo-empty-wrap">
        <div className="uo-empty-card">
          <div className="uo-empty-icon">
            <FiShoppingBag />
          </div>
          <h3>No Orders Yet</h3>
          <p>Looks like you have not placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="uo-page">
      <section className="uo-hero">
        <div className="uo-hero-left">
          <div className="uo-hero-title-row">
            <FiPackage />
            <h2>Track Orders</h2>
          </div>
          <p>
            Stay updated on your purchases with a cleaner and professional order timeline.
          </p>
        </div>
        <div className="uo-summary-grid">
          <article className="uo-summary-card">
            <span>Orders</span>
            <strong>{orderStats.totalOrders}</strong>
          </article>
          <article className="uo-summary-card">
            <span>Items</span>
            <strong>{orderStats.totalItems}</strong>
          </article>
          <article className="uo-summary-card">
            <span>Total Spend</span>
            <strong>Rs. {orderStats.totalSpend.toLocaleString()}</strong>
          </article>
        </div>
      </section>

      <section className="uo-orders-list">
        {orders.map((order, orderIndex) => {
          const statusConfig = getStatusConfig(order.Status);
          const steps = getTrackingSteps(order.Status);

          return (
            <article key={order._id} className="uo-order-card">
              <header className="uo-order-header">
                <div className="uo-order-id-block">
                  <span className="uo-order-index">#{String(orderIndex + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p>
                      <FiCalendar />
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className={statusConfig.chipClass}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </header>

              <div className="uo-progress">
                {steps.map((step, index) => (
                  <div key={step.title} className="uo-progress-step-wrap">
                    <div className={`uo-progress-step uo-progress-step-${step.state}`}>
                      {step.state === "complete" ? <FiCheckCircle /> : <span>{index + 1}</span>}
                    </div>
                    <p>{step.title}</p>
                    {index < steps.length - 1 && <span className={`uo-progress-line uo-progress-line-${step.state}`} />}
                  </div>
                ))}

                {normalizeStatus(order.Status) === "cancelled" && (
                  <p className="uo-cancel-note">This order was cancelled and no further tracking updates are available.</p>
                )}
              </div>

              <div className="uo-info-grid">
                <div className="uo-info-card">
                  <h4>Customer</h4>
                  <div className="uo-info-row"><FiUser /> <span>{order.FullName}</span></div>
                  <div className="uo-info-row"><FiMail /> <span>{order.Email}</span></div>
                  <div className="uo-info-row"><FiPhone /> <span>+{order.Phone}</span></div>
                  <div className="uo-info-row"><FiMapPin /> <span>{order.Address}</span></div>
                </div>

                <div className="uo-info-card">
                  <h4>Items Ordered ({order.cart?.length || 0})</h4>
                  <ul className="uo-item-list">
                    {order.cart?.map((item, index) => (
                      <li key={item._id || `${item.name}-${index}`}>
                        <span className="uo-item-index">{index + 1}</span>
                        <div>
                          <strong>{item.name}</strong>
                          <p>Qty: {item.quantity || 1}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <footer className="uo-order-footer">
                <div>
                  <span>Total Amount</span>
                  <strong>Rs. {(Number(order.Total) || 0).toLocaleString()}</strong>
                </div>
                <div className="uo-meta">
                  <span>{order.cart?.length || 0} item{(order.cart?.length || 0) > 1 ? "s" : ""}</span>
                  <span>Order ID: {order._id.slice(-6).toUpperCase()}</span>
                </div>
              </footer>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default UserOrder;