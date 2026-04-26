import React, { useContext, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import CartContext from "../Context/CartContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import axios from "axios";
import "../../Style/OrderForm.css";
const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");
const OrderForm = () => {
  const navigate = useNavigate();
  const { cart, clearCart, user, loginStatus } = useContext(CartContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      FullName: "",
      Email: "",
      Phone: "",
      Address: "",
      CardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [cart],
  );

  const discountRate = loginStatus ? 0.15 : 0;
  const discountAmount = totalPrice * discountRate;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  useEffect(() => {
    reset({
      FullName: user?.Username || "",
      Email: user?.Email || "",
      Phone: user?.Phone || "",
      Address: user?.Address || "",
      CardNumber: "",
      expiry: "",
      cvv: "",
    });
  }, [user, reset]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
  const getItemImage = (item) => item?.imageUrl || item?.images?.[0] || item?.img || "";
  const isCartEmpty = cart.length === 0;

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        Total: Number(finalPrice.toFixed(2)),
        cart: cart.map((item) => ({ name: item.name })),
      };

      const res = await axios.post(`${BACKEND_URI}/orders/createOrder`, {
        data: payload,
      });

      if (res.status === 200) {
        clearCart();
        navigate("/feedback");
      }
    } catch (error) {
      console.error("Order submission error:", error);
    }
  };

  return (
    <main className="of-page">
      <div className="of-orb of-orb-a" aria-hidden="true" />
      <div className="of-orb of-orb-b" aria-hidden="true" />

      <section className="of-shell">
        <header className="of-hero">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="of-hero-copy"
          >
            <p className="of-eyebrow">Secure Checkout</p>
            <h1>
              Complete Your <span>Order</span>
            </h1>
            <p className="of-subtitle">
              Aligned with your cart style: cleaner spacing, calmer layout, and faster checkout flow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="of-hero-stats"
          >
            <article>
              <span>Items</span>
              <strong>{cart.length}</strong>
            </article>
            <article>
              <span>Amount</span>
              <strong>{formatCurrency(finalPrice)}</strong>
            </article>
          </motion.div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="of-grid">
          <div className="of-form-col">
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="of-card"
            >
              <div className="of-card-head">
                <div className="of-icon of-icon-purple">
                  <MapPin />
                </div>
                <div>
                  <h2>Shipping Details</h2>
                  <p>Tell us where to deliver your package.</p>
                </div>
              </div>

              <div className="of-fields-grid">
                <div className="of-field of-field-span-2">
                  <label htmlFor="full-name">Full Name</label>
                  <div className="of-input-wrap">
                    <User className="of-input-icon" />
                    <input
                      id="full-name"
                      type="text"
                      placeholder="John Doe"
                      {...register("FullName", { required: "Full name is required" })}
                    />
                  </div>
                  {errors.FullName && <p className="of-error">{errors.FullName.message}</p>}
                </div>

                <div className="of-field">
                  <label htmlFor="email">Email Address</label>
                  <div className="of-input-wrap">
                    <Mail className="of-input-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register("Email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                  </div>
                  {errors.Email && <p className="of-error">{errors.Email.message}</p>}
                </div>

                <div className="of-field">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="of-input-wrap">
                    <Phone className="of-input-icon" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      {...register("Phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\-\s()]{7,20}$/,
                          message: "Enter a valid phone number",
                        },
                      })}
                    />
                  </div>
                  {errors.Phone && <p className="of-error">{errors.Phone.message}</p>}
                </div>

                <div className="of-field of-field-span-2">
                  <label htmlFor="address">Street Address</label>
                  <textarea
                    id="address"
                    rows={4}
                    placeholder="Street, city, state, postal code"
                    {...register("Address", { required: "Address is required" })}
                  />
                  {errors.Address && <p className="of-error">{errors.Address.message}</p>}
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="of-card"
            >
              <div className="of-card-head">
                <div className="of-icon of-icon-pink">
                  <CreditCard />
                </div>
                <div>
                  <h2>Payment Details</h2>
                  <p>Encrypted and secured payment processing.</p>
                </div>
              </div>

              <div className="of-fields-grid">
                <div className="of-field of-field-span-2">
                  <label htmlFor="card-number">Card Number</label>
                  <div className="of-input-wrap">
                    <CreditCard className="of-input-icon" />
                    <input
                      id="card-number"
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      {...register("CardNumber", {
                        required: "Card number is required",
                        minLength: { value: 12, message: "Card number is too short" },
                      })}
                    />
                  </div>
                  {errors.CardNumber && <p className="of-error">{errors.CardNumber.message}</p>}
                </div>

                <div className="of-field">
                  <label htmlFor="expiry">Expiry Date</label>
                  <div className="of-input-wrap">
                    <CalendarClock className="of-input-icon" />
                    <input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      {...register("expiry", {
                        required: "Expiry date is required",
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/(\d{2})$/,
                          message: "Use MM/YY format",
                        },
                      })}
                    />
                  </div>
                  {errors.expiry && <p className="of-error">{errors.expiry.message}</p>}
                </div>

                <div className="of-field">
                  <label htmlFor="cvv">CVV</label>
                  <div className="of-input-wrap">
                    <ShieldCheck className="of-input-icon" />
                    <input
                      id="cvv"
                      type="password"
                      maxLength={4}
                      placeholder="123"
                      {...register("cvv", {
                        required: "CVV is required",
                        pattern: {
                          value: /^\d{3,4}$/,
                          message: "CVV must be 3 or 4 digits",
                        },
                      })}
                    />
                  </div>
                  {errors.cvv && <p className="of-error">{errors.cvv.message}</p>}
                </div>
              </div>
            </motion.section>
          </div>

          <aside className="of-summary-col">
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="of-summary-card"
            >
              <div className="of-summary-head">
                <h2>
                  <ShoppingBag />
                  Order Summary
                </h2>
                {loginStatus && <span className="of-discount-chip">15% Member Discount</span>}
              </div>

              {isCartEmpty ? (
                <div className="of-empty-summary">
                  <AlertCircle />
                  <p>Your cart is empty. Add products to continue.</p>
                  <Link to="/catalog" className="of-secondary-btn">
                    Browse Catalog
                    <ArrowLeft />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="of-items-list">
                    {cart.map((item, index) => (
                      <article key={`${item.id || item._id || item.name}-${index}`} className="of-item-row">
                        <div className="of-item-image-wrap">
                          {getItemImage(item) ? (
                            <img src={getItemImage(item)} alt={item.name} className="of-item-image" />
                          ) : (
                            <div className="of-item-image-fallback">No Image</div>
                          )}
                        </div>

                        <div className="of-item-copy">
                          <input type="hidden" {...register(`cart.${index}.name`)} value={item.name || ""} readOnly />
                          <h4>{item.name}</h4>
                          <p>{formatCurrency(item.price)}</p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="of-summary-lines">
                    <div>
                      <span>Subtotal</span>
                      <strong>{formatCurrency(totalPrice)}</strong>
                    </div>

                    {loginStatus && (
                      <div className="of-line-discount">
                        <span>Discount (15%)</span>
                        <strong>- {formatCurrency(discountAmount)}</strong>
                      </div>
                    )}

                    <div>
                      <span>Shipping</span>
                      <strong className="of-free-shipping">FREE</strong>
                    </div>

                    <div className="of-total-line">
                      <span>Total</span>
                      <strong>{formatCurrency(finalPrice)}</strong>
                    </div>
                  </div>

                  <input type="hidden" {...register("Total")} value={Number(finalPrice.toFixed(2))} readOnly />

                  <button type="submit" disabled={isSubmitting || isCartEmpty} className="of-primary-btn">
                    {isSubmitting ? (
                      <span className="of-spinner-wrap">
                        <span className="of-spinner" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Check />
                        Place Order
                      </>
                    )}
                  </button>
                </>
              )}

              <p className="of-security-note">
                <ShieldCheck /> SSL Encrypted Checkout
              </p>
            </motion.section>
          </aside>
        </form>
      </section>
    </main>
  );
};

export default OrderForm;
