import React, { useContext, useState } from "react";
import CartContext from "../Context/CartContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Plus,
  Minus,
  ShieldCheck,
  Tag,
  X,
  Loader2,
  CheckCircle2
} from "lucide-react";

function Cart() {
  const { handleSubmit } = useForm();

  const { cart, removeFromCart, loginStatus } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const Navigate = useNavigate();

  const totalPrice = cart.reduce((sum, item) => {
    const qty = quantities[item.id] || 1;
    return sum + item.price * qty;
  }, 0);

  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const freeShipping = appliedDiscount?.type === "Free Shipping";
  const finalPrice = totalPrice - discountAmount;

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await axios.post("http://localhost:3000/discounts/applyDiscount", {
        code: promoCode.trim(),
        cartTotal: totalPrice,
      });
      setAppliedDiscount(res.data.discount);
      setPromoError("");
    } catch (err) {
      setAppliedDiscount(null);
      setPromoError(err.response?.data?.message || "Failed to apply promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedDiscount(null);
    setPromoCode("");
    setPromoError("");
  };

  const updateQuantity = (id, change) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const newQty = Math.max(1, current + change);
      return { ...prev, [id]: newQty };
    });
  };

  const onSubmit = async (data) => {
    console.log("Form Data is ", data); 
    let r = await axios.post("http://localhost:3000/order", {
      item: data,
    });
    console.log("Order Response is ", r);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#F8FAFC] pt-32 pb-12 font-sans text-slate-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Shopping Cart
            </h1>
            <p className="mt-2 text-slate-500 font-medium">
              Review your selected items before checkout
            </p>
          </motion.div>
          {cart.length > 0 && (
            <div className="mt-4 md:mt-0 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 shadow-sm">
              {cart.length} {cart.length === 1 ? "item" : "items"} inside
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8 max-w-sm text-center">
              Looks like you haven't added anything yet. Discover our latest collections.
            </p>
            <Link to="/catalog">
              <button className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95">
                Start Shopping <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Cart Items */}
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence>
                  {cart.map((item, index) => {
                    const qty = quantities[item.id] || 1;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 relative"
                      >
                        {/* Image Container */}
                        <div className="w-full sm:w-40 h-48 sm:h-36 shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Details Container */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start pe-8 sm:pe-0">
                              <h3 className="text-xl font-bold text-slate-800 line-clamp-1">
                                {item.name}
                              </h3>
                              <span className="text-xl font-bold text-slate-900 hidden sm:block">
                                ${(item.price * qty).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 capitalize mt-1 font-medium">
                              {item.category}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between sm:justify-start gap-6">
                            {/* Mobile Price */}
                            <span className="text-xl font-bold text-slate-900 sm:hidden">
                              ${(item.price * qty).toFixed(2)}
                            </span>

                            {/* Quantity Control */}
                            <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-200">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-slate-900 hover:shadow transition-all"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold select-none">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-slate-900 hover:shadow transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="absolute sm:static top-5 right-5 sm:self-center p-2.5 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:w-1/3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sticky top-24 isolate"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Order Summary
                </h2>

                {/* Promo Code Section */}
                <div className="mb-6">
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">
                          {appliedDiscount.code}
                        </span>
                        <span className="text-xs text-emerald-600">
                          {appliedDiscount.type === "Percentage"
                            ? `${appliedDiscount.value}% off`
                            : appliedDiscount.type === "Fixed Amount"
                            ? `$${appliedDiscount.value} off`
                            : "Free Shipping"}
                        </span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="p-1 rounded-full hover:bg-emerald-100 text-emerald-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Promo code"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              setPromoError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && applyPromoCode()}
                            className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <button
                          onClick={applyPromoCode}
                          disabled={promoLoading || !promoCode.trim()}
                          className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95"
                        >
                          {promoLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                          {promoError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8 text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  {appliedDiscount && appliedDiscount.type !== "Free Shipping" && (
                    <div className="flex justify-between">
                      <span className="text-emerald-600">
                        Discount ({appliedDiscount.type === "Percentage" ? `${appliedDiscount.value}%` : `$${appliedDiscount.value}`})
                      </span>
                      <span className="text-emerald-600 font-semibold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping estimate</span>
                    <span className="text-emerald-600 flex items-center gap-1">
                      Free <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>
                  {freeShipping && appliedDiscount && (
                    <div className="flex justify-between">
                      <span className="text-emerald-600">Free Shipping Applied</span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax estimate</span>
                    <span className="text-slate-900">$0.00</span>
                  </div>

                  <div className="border-t border-slate-100 pt-5 mt-5">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-slate-900">Order Total</span>
                      <div className="text-right">
                        {appliedDiscount && discountAmount > 0 && (
                          <span className="text-sm text-slate-400 line-through block">
                            ${totalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-3xl font-extrabold text-slate-900">
                          ${finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-right">
                      Including VAT
                    </p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                 <Link to='/orderform'> <button
                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-lg shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer relative z-10"
                  >
                    Checkout
                    <ArrowLeft className="w-5 h-5 rotate-180 pointer-events-none" />
                  </button>
                  </Link>
                  <Link to="/catalog" className="block relative z-10">
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all font-semibold active:scale-95 cursor-pointer relative z-10">
                      Continue Shopping
                    </button>
                  </Link>
                </div>




           {loginStatus ? (
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-400">
              <span className="text-xs font-semibold animate-pulse uppercase tracking-wider">You are signed in!</span>
            </div>
           ) : (
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-400">
             <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <span className="text-xs font-semibold animate-pulse uppercase tracking-wider">Sign In for exclusive offers</span>
             </Link>
            </div>
           )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
