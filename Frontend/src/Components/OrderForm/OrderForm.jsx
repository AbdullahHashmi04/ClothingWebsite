import React, { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import CartContext from "../Context/CartContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  ShieldCheck,
  Lock,
  ShoppingBag,
} from "lucide-react";
import axios from "axios";

const OrderForm = () => {

  const navigate = useNavigate();
  const { cart, clearCart, user, loginStatus } = useContext(CartContext);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:3000/orders/createOrder", {
        data,
      });
      if (res.status === 200) {
        clearCart();
        navigate("/");
      }
    } catch (error) {
      console.error("Order submission error:", error);
    }
  };

  useEffect(() => {
    console.log("User", user);
  }, [user]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const discountRate = loginStatus ? 0.15 : 0;
  const discountAmount = totalPrice * discountRate;
  const finalPrice = totalPrice - discountAmount;

  // Reusable Input Component style class
  const inputClassName =
    "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const inputClassNameNoIcon =
    "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#F8FAFC] pt-32 pb-12 font-sans text-slate-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 pb-6 border-b border-slate-200"
          >
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Checkout
            </h1>
            <p className="mt-2 text-slate-500 font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" /> Secure your order
            </p>
          </motion.div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid lg:grid-cols-12 gap-10"
          >
            {/* Left Column: Forms */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Shipping Details
                    </h2>
                    <p className="text-sm text-slate-500">
                      Where should we send your order?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="gap-2 text-sm font-bold text-slate-700 mb-2 flex">
                        <User className=" w-5 h-5 text-slate-400" />
                      Full Name
                    </label>
                    <div className="relative flex">
                      <div className=" absolute inset-y-0 left-0 pl-4 flex items-center justify-end pointer-events-none">
                      </div>
                      <input
                        type="text"
                        {...register("FullName", {
                          required: "Full name is required",
                        })}
                        className={inputClassName}
                        placeholder="John Doe"
                        value={user ? user.Username : ""}
                      />
                    </div>
                    {errors.FullName && (
                      <p className="text-red-500 text-xs font-semibold mt-2">
                        {errors.FullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="gap-2 text-sm font-bold text-slate-700 mb-2 flex">
                        <Mail className="w-5 h-5 text-slate-400" />
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      </div>
                      <input
                        type="email"
                        {...register("Email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className={inputClassName}
                        placeholder="john@example.com"
                        value={user ? user.Email : ""}
                      />
                    </div>
                    {errors.Email && (
                      <p className="text-red-500 text-xs font-semibold mt-2">
                        {errors.Email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="gap-2 text-sm font-bold text-slate-700 mb-2 flex">
                        <Phone className="w-5 h-5 text-slate-400" />
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...register("Phone", {
                          required: "Phone number is required",
                        })}
                        className={inputClassName}
                        placeholder="+1 (555) 123-4567"
                        value={user ? user.Phone : ""}
                      />
                    </div>
                    {errors.Phone && (
                      <p className="text-red-500 text-xs font-semibold mt-2">
                        {errors.Phone.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Street Address
                    </label>
                    <textarea
                      {...register("Address", {
                        required: "Address is required",
                      })}
                      className={`${inputClassNameNoIcon} resize-none h-28`}
                      placeholder="123 Main St, Apt 4B, City, State, ZIP"
                      value={user ? user.Address : ""}
                    />
                    {errors.Address && (
                      <p className="text-red-500 text-xs font-semibold mt-2">
                        {errors.Address.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Payment Method
                    </h2>
                    <p className="text-sm text-slate-500">
                      All transactions are secure and encrypted.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex gap-2 text-sm font-bold text-slate-700 mb-2">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                      Card Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      </div>
                      <input
                        type="text"
                        {...register("CardNumber", {
                          required: "Card number is required",
                        })}
                        className={inputClassName}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    {errors.CardNumber && (
                      <p className="text-red-500 text-xs font-semibold mt-2">
                        {errors.CardNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        {...register("expiry", {
                          required: "Expiry date is required",
                        })}
                        className={inputClassNameNoIcon}
                        placeholder="MM/YY"
                      />
                      {errors.expiry && (
                        <p className="text-red-500 text-xs font-semibold mt-2">
                          {errors.expiry.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        {...register("cvv", { required: "CVV is required" })}
                        className={inputClassNameNoIcon}
                        placeholder="123"
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-xs font-semibold mt-2">
                          {errors.cvv.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900 rounded-4xl gap-y-6 h-150 shadow-xl p-8 sticky top-24 text-white"
              >
                <h2 className="text-xl font-bold mb-6 flex justify-center items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                  {cart.map((item, index) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Hidden inputs to preserve form submission functionality */}
                        <input
                          type="hidden"
                          {...register(`cart.${index}.name`)}
                          value={item.name}
                        />
                        <input
                          type="hidden"
                          {...register(`cart.${index}.price`)}
                          value={item.price}
                        />

                        <h4 className="font-semibold text-sm truncate text-slate-100">
                          {item.name}
                        </h4>
                        <p className="text-slate-400 text-sm mt-0.5">
                          ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t space-y-4  border-white/10 pt-5">
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Subtotal</span>
                     <span className="font-medium text-white justify-end -through">
                        ${totalPrice.toFixed(2)}
                      </span>

                    {loginStatus && (
                      <span className="font-medium text-white justify-end -through">
                        ${totalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {loginStatus && (
                    <div className="flex justify-between">
                      <span className="text-emerald-600">Discount (15%)</span>
                      <span className="text-emerald-600 font-semibold">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-medium tracking-wide">
                      FREE
                    </span>
                  </div>
                  <div className="text-right">
                    {loginStatus && (
                      <span className="text-sm text-slate-400 line-through block">
                        ${totalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/10">
                    <span className="text-lg font-bold">Total</span>
                    <div className="text-right">
                      {/* Using readOnly input to preserve original functional behavior exactly */}
                      <input
                        type="text"
                        readOnly
                        {...register("Total")}
                        value={`${finalPrice}`}
                        className="bg-transparent text-2xl font-extrabold text-white w-20 text-right outline-none cursor-default"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-indigo-500 hover:bg-indigo-400 text-white py-4 rounded-xl 
                  font-bold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-400 mt-6 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> SSL Encrypted Checkout
                </p>
              </motion.div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
