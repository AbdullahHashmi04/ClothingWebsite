import React, { useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import CartContext from "../Context/CartContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import axios from "axios";
import Payment from "../Payment/Payment.jsx";
import "../../Style/OrderForm.css";
const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");
const OrderForm = () => {
  const navigate = useNavigate();
  const { cart, clearCart, user, loginStatus } = useContext(CartContext);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [orderError, setOrderError] = useState("");
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

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
    });
  }, [user, reset]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
  const getItemImage = (item) => item?.imageUrl || item?.images?.[0] || item?.img || "";
  const isCartEmpty = cart.length === 0;

  const onSubmit = async (data) => {
    setOrderError("");
    const orderData = {
      ...data,
      Total: Number(finalPrice.toFixed(2)),
      cart: cart.map((item) => {
        const quantity = Number(item.quantity ?? item.qty ?? 1);
        const price = Number(item.price || 0);

        return {
          name: item.name,
          quantity,
          price: price.toFixed(2),
        };
      }),
    };
    
    
    setPendingOrder(orderData);
    setPaymentStarted(true);
  };

  // Create payment success handler that uses the order data
  const createPaymentSuccessHandler = (orderData) => {
    return async () => {
      if (!orderData) {
        setOrderError("Missing order details. Please submit the form again.");
        throw new Error("No order data");
      }

      setOrderSubmitting(true);

      try {
        
        const res = await axios.post(`${BACKEND_URI}/orders/createOrder`, {
          data: orderData,
        });
        if (res.status === 200) {
          clearCart();
          setPaymentStarted(false); // Reset payment state
          setPendingOrder(null);
          navigate("/feedback");
        } else {
          setOrderError("Payment succeeded, but the order could not be saved. Status: " + res.status);
          throw new Error("Order creation returned non-200 status");
        }
      } catch (error) {
        console.error("❌ Order submission error:", error);
        setOrderError(
          error.response?.data?.message || 
          error.message ||
          "Payment succeeded, but order submission failed."
        );
        throw error; // Re-throw so CheckoutForm knows there was an error
      } finally {
        setOrderSubmitting(false);
      }
    };
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
                  <ShieldCheck />
                </div>
                <div>
                  <h2>Stripe Sandbox Payment</h2>
                  <p>Your card details will be entered inside Stripe, not in this form.</p>
                </div>
              </div>

              <p className="of-security-note" style={{ marginTop: 0 }}>
                Submit the shipping and account details first. Stripe will open with your order total next.
              </p>

              {paymentStarted && pendingOrder && (
                <div className="of-stripe-panel">
                  <Payment 
                    amount={finalPrice} 
                    onSuccess={createPaymentSuccessHandler(pendingOrder)} 
                  />
                </div>
              )}
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

                  <button type="submit" disabled={isSubmitting || isCartEmpty || orderSubmitting} className="of-primary-btn">
                    {isSubmitting || orderSubmitting ? (
                      <span className="of-spinner-wrap">
                        <span className="of-spinner" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Check />
                        Continue to Secure Payment
                      </>
                    )}
                  </button>

                  {orderError && <p className="of-error">{orderError}</p>}
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
