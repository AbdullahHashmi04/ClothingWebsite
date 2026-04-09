import React, { useContext, useMemo, useState } from "react";
import CartContext from "../Context/CartContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import "../../Style/Cart.css";

function getItemKey(item, index) {
  return item?.id || item?._id || item?.cartItemId || `${item?.name || "item"}-${index}`;
}

function getItemImage(item) {
  return item?.imageUrl || item?.images?.[0] || item?.img || "";
}

function Cart() {
  const { cart, removeFromCart, loginStatus } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const cartWithKeys = useMemo(
    () => cart.map((item, index) => ({ ...item, _cartKey: getItemKey(item, index) })),
    [cart],
  );

  const subtotal = cartWithKeys.reduce((sum, item) => {
    const qty = quantities[item._cartKey] || 1;
    return sum + Number(item.price || 0) * qty;
  }, 0);

  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const freeShipping = appliedDiscount?.type === "Free Shipping";
  const total = Math.max(0, subtotal - discountAmount);

  const updateQuantity = (itemKey, change) => {
    setQuantities((prev) => {
      const current = prev[itemKey] || 1;
      const next = Math.max(1, current + change);
      return { ...prev, [itemKey]: next };
    });
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await axios.post("http://localhost:3000/discounts/applyDiscount", {
        code: promoCode.trim(),
        cartTotal: subtotal,
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

  const itemCount = cartWithKeys.length;

  return (
    <main className="cart-page">
      <div className="cart-orb cart-orb-a" aria-hidden="true" />
      <div className="cart-orb cart-orb-b" aria-hidden="true" />

      <section className="cart-shell">
        <header className="cart-hero">
          <div>
            <p className="cart-eyebrow">Your Basket</p>
            <h1>Review Cart</h1>
            <p className="cart-subtitle">Clean summary, fast edits, and a smoother checkout journey.</p>
          </div>
          <div className="cart-hero-stats">
            <article>
              <span>Items</span>
              <strong>{itemCount}</strong>
            </article>
            <article>
              <span>Subtotal</span>
              <strong>Rs. {subtotal.toLocaleString()}</strong>
            </article>
          </div>
        </header>

        {itemCount === 0 ? (
          <section className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag />
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you have not added anything yet. Explore products and build your outfit.</p>
            <Link to="/catalog" className="cart-primary-btn cart-empty-btn">
              Start Shopping
              <ArrowLeft />
            </Link>
          </section>
        ) : (
          <section className="cart-grid">
            <div className="cart-items-col">
              {cartWithKeys.map((item) => {
                const qty = quantities[item._cartKey] || 1;
                const lineTotal = Number(item.price || 0) * qty;
                const image = getItemImage(item);
                return (
                  <article key={item._cartKey} className="cart-item-card">
                    <div className="cart-item-image-wrap">
                      {image ? (
                        <img src={image} alt={item.name} className="cart-item-image" />
                      ) : (
                        <div className="cart-item-image-fallback">No Image</div>
                      )}
                    </div>

                    <div className="cart-item-content">
                      <div className="cart-item-top">
                        <div>
                          <h3>{item.name}</h3>
                          <p>{item.category || "Fashion"}</p>
                        </div>
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.id || item._id)}
                          aria-label="Remove item"
                        >
                          <Trash2 />
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-qty-control">
                          <button type="button" onClick={() => updateQuantity(item._cartKey, -1)}>
                            <Minus />
                          </button>
                          <span>{qty}</span>
                          <button type="button" onClick={() => updateQuantity(item._cartKey, 1)}>
                            <Plus />
                          </button>
                        </div>

                        <div className="cart-pricing">
                          <small>Unit: Rs. {Number(item.price || 0).toLocaleString()}</small>
                          <strong>Rs. {lineTotal.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary-card">
              <h2>Order Summary</h2>

              {!appliedDiscount ? (
                <div className="cart-promo-box">
                  <label htmlFor="promo-input">Promo code</label>
                  <div className="cart-promo-input-row">
                    <input
                      id="promo-input"
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromoCode()}
                    />
                    <button
                      type="button"
                      className="cart-apply-btn"
                      onClick={applyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                    >
                      {promoLoading ? <Loader2 className="spin" /> : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="cart-promo-error">{promoError}</p>}
                </div>
              ) : (
                <div className="cart-promo-applied">
                  <div>
                    <span className="cart-promo-chip">
                      <CheckCircle2 />
                      {appliedDiscount.code}
                    </span>
                    <p>
                      {appliedDiscount.type === "Percentage"
                        ? `${appliedDiscount.value}% off`
                        : appliedDiscount.type === "Fixed Amount"
                          ? `Rs. ${appliedDiscount.value} off`
                          : "Free Shipping"}
                    </p>
                  </div>
                  <button type="button" onClick={removePromoCode} aria-label="Remove promo">
                    <X />
                  </button>
                </div>
              )}

              <div className="cart-summary-lines">
                <div>
                  <span>Subtotal</span>
                  <strong>Rs. {subtotal.toLocaleString()}</strong>
                </div>

                {appliedDiscount && appliedDiscount.type !== "Free Shipping" && (
                  <div className="cart-discount-line">
                    <span>
                      Discount ({appliedDiscount.type === "Percentage" ? `${appliedDiscount.value}%` : `Rs. ${appliedDiscount.value}`})
                    </span>
                    <strong>- Rs. {discountAmount.toLocaleString()}</strong>
                  </div>
                )}

                <div>
                  <span>Shipping</span>
                  <strong className="cart-free-line">
                    <ShieldCheck /> Free
                  </strong>
                </div>

                {freeShipping && (
                  <div>
                    <span>Free Shipping Offer</span>
                    <strong className="cart-free-line">Applied</strong>
                  </div>
                )}

                <div>
                  <span>Tax</span>
                  <strong>Rs. 0</strong>
                </div>
              </div>

              <div className="cart-total-block">
                <span>Total</span>
                <div>
                  {appliedDiscount && discountAmount > 0 && (
                    <small>Rs. {subtotal.toLocaleString()}</small>
                  )}
                  <strong>Rs. {total.toLocaleString()}</strong>
                </div>
              </div>

              <div className="cart-cta-group">
                <Link to="/orderform" className="cart-primary-btn">
                  Proceed to Checkout
                  <ArrowLeft />
                </Link>
                <Link to="/catalog" className="cart-secondary-btn">
                  Continue Shopping
                </Link>
              </div>

              <p className="cart-auth-note">
                {loginStatus ? "You are signed in." : "Sign in to unlock exclusive offers and faster checkout."}
              </p>
            </aside>
          </section>
        )}
      </section>
    </main>
  );
}

export default Cart;