import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  FiPackage,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiShoppingBag,
} from "react-icons/fi";
import CartContext from "../../Context/CartContext";

const UserOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(CartContext)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/orders/getUserOrders/${user.Email}`,
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
  }, []);

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return {
          icon: <FiCheckCircle className="w-4 h-4" />,
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "pending":
        return {
          icon: <FiClock className="w-4 h-4" />,
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          dot: "bg-amber-500",
        };
      default:
        return {
          icon: <FiXCircle className="w-4 h-4" />,
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-500",
        };
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-lg">
            Loading your orders...
          </p>
        </div>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <FiShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Orders Yet
          </h3>
          <p className="text-gray-500">
            Looks like you haven't placed any orders yet.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FiPackage className="w-8 h-8 text-indigo-200" />
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              My Orders
            </h2>
          </div>
          <p className="text-indigo-200 text-lg ml-11">
            You have placed{" "}
            <span className="font-bold text-white">{orders.length}</span>{" "}
            order{orders.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-5xl mx-auto px-6 -mt-6 pb-16">
        {orders.map((order, orderIndex) => {
          const statusConfig = getStatusConfig(order.Status);
          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 mb-8 overflow-hidden hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-shadow duration-300"
            >
              {/* Order Top Bar */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                      <FiPackage className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs text-gray-500">Order</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                      <FiCalendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                  >
                    {statusConfig.icon}
                    <span className="text-sm font-bold uppercase tracking-wide">
                      {order.Status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Customer Details */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Customer Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                          Full Name
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {order.FullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <FiMail className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {order.Email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <FiPhone className="w-4 h-4 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          +{order.Phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <FiMapPin className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                          Address
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {order.Address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Items Ordered ({order.cart?.length})
                  </h4>
                  <div className="space-y-3">
                    {order.cart?.map((item, index) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white rounded-xl px-5 py-4 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            ID: {item._id}
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-xs uppercase tracking-widest font-semibold">
                      Order Total
                    </p>
                    <p className="text-white text-sm mt-0.5">
                      {order.cart?.length} item
                      {order.cart?.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-3xl font-extrabold text-white tracking-tight">
                    Rs. {order.Total?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrder;