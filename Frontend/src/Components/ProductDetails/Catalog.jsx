import React, { useState, useContext } from "react";
import CartContext from "../Context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  Search,
  Package,
  X,
  ChevronRight,
  Ruler,
  Tag,
  Truck,
  RotateCcw,
  Shield,
  Zap,
} from "lucide-react";
import "../../Style/Catalog.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import size_guide from "../../Images/size_guide.jpg"

const CATEGORIES = ["All", "shirts", "pants", "accessories", "dresses"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ClothingCatalog() {
  const navigate = useNavigate();
  const { addToCart, mycategory, setCategory, catalogData, addVtoImage } =
    useContext(CartContext);
  const [showToast, setShowToast] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(mycategory || "All");
  const { user } = useContext(CartContext);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [modalSize, setModalSize] = useState("M");
  const [modalQuantity, setModalQuantity] = useState(1);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());

  const getProductImages = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    return product?.imageUrl ? [product.imageUrl] : [];
  };

  const getProductImage = (product, index = 0) => {
    const images = getProductImages(product);
    return (
      images[index] || images[0] || product?.image || product?.thumbnail || ""
    );
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart({
      ...product,
      name: product.title || product.name,
      img: getProductImage(product),
      price: product.price || Math.floor(Math.random() * 200) + 20,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleVtoImages = (product, e) => {
    if (e) e.stopPropagation();
    addVtoImage({
      ...product,
      name: product.title || product.name,
      img: getProductImage(product),
      price: product.price || Math.floor(Math.random() * 200) + 20,
    });
  };

  // Navigate to VTO after setting the product (combines both steps safely)
  const handleVtoClick = (product, e) => {
    e.stopPropagation();
    e.preventDefault();
    addVtoImage({
      ...product,
      name: product.title || product.name,
      img: getProductImage(product),
      price: product.price || Math.floor(Math.random() * 200) + 20,
    });
    navigate("/vto");
  };

  const filteredProducts = catalogData.filter((p) => {
    const matchesQuery = (p.title || p.name || "")
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesQuery && matchesCategory;
  });

  const addToWishlist = async (item, e) => {
    if (e) e.stopPropagation();
    if (user && user.Email) {
      try {
        await axios.post("http://localhost:3000/wishlist/add", {
          Email: user.Email,
          product: {
            _id: item._id,
            name: item.name,
            price: item.price,
            imageUrl: getProductImage(item),
          },
        });
        setWishlistedItems((prev) => new Set([...prev, item._id]));
        setShowWishlistToast(true);
        setTimeout(() => setShowWishlistToast(false), 2500);
      } catch (error) {
        if (error.response?.status === 409) {
          alert("Item already in wishlist!");
        } else {
          console.error("Wishlist error:", error);
          alert("Failed to add to wishlist");
        }
      }
    } else {
      alert("Please login to add items to wishlist");
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalImageIndex(0);
    setModalSize("M");
    setModalQuantity(1);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = "";
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    addToCart({
      ...selectedProduct,
      name: selectedProduct.title || selectedProduct.name,
      img: getProductImage(selectedProduct, modalImageIndex),
      price: selectedProduct.price || 0,
      size: modalSize,
      quantity: modalQuantity,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    closeModal();
  };

const [showSizeGuide, setShowSizeGuide] = useState(false);

  const getRating = (product) =>
    product.rating || (4 + Math.random()).toFixed(1);
  const selectedProductImages = selectedProduct
    ? getProductImages(selectedProduct)
    : [];
  const selectedMainImage = selectedProduct
    ? getProductImage(selectedProduct, modalImageIndex)
    : "";

  return (
    <div className="cat-page">
      <div className="cat-container">
        {/* ─── HEADER ─── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="cat-header"
        >
          <div className="cat-header-badge">
            <Zap size={14} /> New Season Collection
          </div>
          <h1 className="cat-title">
            Discover Your{" "}
            <span className="cat-title-gradient">Perfect Style</span>
          </h1>
          <p className="cat-subtitle">
            Curated fashion pieces crafted with precision & elegance
          </p>
        </motion.div>

        {/* ─── FILTERS ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="cat-filters"
        >
          <div className="cat-search-wrapper">
            <Search className="cat-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search products, styles, brands..."
              className="cat-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="catalog-search"
            />
            {query && (
              <button className="cat-search-clear" onClick={() => setQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="cat-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCategory(cat === "All" ? "" : cat);
                }}
                className={`cat-cat-btn ${selectedCategory === cat ? "cat-cat-btn--active" : ""}`}
                id={`cat-filter-${cat.toLowerCase()}`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── RESULTS COUNT ─── */}
        {filteredProducts.length > 0 && (
          <p className="cat-results-count">
            Showing <strong>{filteredProducts.length}</strong> of{" "}
            <strong>{catalogData.length}</strong> products
          </p>
        )}

        {/* ─── PRODUCTS GRID ─── */}
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="cat-empty"
            >
              <div className="cat-empty-icon-wrap">
                <Package size={52} />
              </div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button
                className="cat-empty-reset"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("All");
                }}
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="cat-grid"
            >
              {filteredProducts.map((item, index) => {
                const price = item.price || 0;
                const discount = item.discountPercentage
                  ? Math.round(item.discountPercentage)
                  : 0;
                const originalPrice =
                  discount > 0
                    ? Math.round(price / (1 - discount / 100))
                    : null;
                const rating = parseFloat(getRating(item));
                const isWishlisted = wishlistedItems.has(item._id);

                return (
                  <motion.div
                    key={item._id || item.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04, duration: 0.4 }}
                    className="cat-card"
                    onClick={() => openModal(item)}
                    id={`product-card-${item._id || index}`}
                  >
                    {/* Image */}
                    <div className="cat-card-img-wrap">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="cat-card-img"
                        loading="lazy"
                      />

                      {/* Badges */}
                      <div className="cat-card-badges">
                        {discount > 0 && (
                          <span className="cat-badge cat-badge--sale">
                            -{discount}%
                          </span>
                        )}
                        {item.stock < 10 && item.stock > 0 && (
                          <span className="cat-badge cat-badge--low">
                            Low Stock
                          </span>
                        )}
                      </div>

                      {/* Wishlist */}
                      <button
                        className={`cat-card-wishlist ${isWishlisted ? "cat-card-wishlist--active" : ""}`}
                        onClick={(e) => addToWishlist(item, e)}
                        aria-label="Add to wishlist"
                        id={`wishlist-btn-${item._id || index}`}
                      >
                        <Heart
                          size={16}
                          fill={isWishlisted ? "#ef4444" : "none"}
                        />
                      </button>

                      {/* VTO Button */}
                      <button
                        className="cat-card-vto"
                        onClick={(e) => handleVtoClick(item, e)}
                      >
                        <span>Try On</span> <ChevronRight size={13} />
                      </button>

                      {/* Overlay */}
                      <div className="cat-card-overlay">
                        <span className="cat-card-overlay-text">
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="cat-card-body">
                      <span className="cat-card-category">
                        {item.category || "Fashion"}
                      </span>
                      <h3 className="cat-card-name">{item.name}</h3>

                      {/* Stars */}
                      <div className="cat-card-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < Math.round(rating)
                                ? "star-filled"
                                : "star-empty"
                            }
                            fill={i < Math.round(rating) ? "#f59e0b" : "none"}
                          />
                        ))}
                        <span className="cat-card-rating-text">({rating})</span>
                      </div>

                      {/* Price Row */}
                      <div className="cat-card-footer">
                        <div className="cat-card-prices">
                          <span className="cat-card-price">
                            Rs. {price.toLocaleString()}
                          </span>
                          {originalPrice && (
                            <span className="cat-card-price-orig">
                              Rs. {originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          className="cat-card-add-btn"
                          onClick={(e) => handleAddToCart(item, e)}
                          aria-label="Add to cart"
                          id={`add-to-cart-${item._id || index}`}
                        >
                          <ShoppingBag size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── PRODUCT MODAL ─── */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            id="product-modal-backdrop"
          >
            <motion.div
              className="modal-box"
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              id="product-modal-box"
            >
              {/* Close */}
              <button
                className="modal-close"
                onClick={closeModal}
                id="modal-close-btn"
              >
                <X size={20} />
              </button>

              <div className="modal-layout">
                {/* Left – Image */}
                <div className="modal-img-section">
                  <div className="modal-img-wrap">
                    <img
                      src={selectedMainImage}
                      alt={selectedProduct.name}
                      className="modal-img"
                    />
                    {selectedProduct.discountPercentage > 0 && (
                      <div className="modal-img-badge">
                        -{Math.round(selectedProduct.discountPercentage)}% OFF
                      </div>
                    )}
                  </div>
                  {selectedProductImages.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      {selectedProductImages.map((img, idx) => (
                        <button
                          key={`${selectedProduct._id || "product"}-${idx}`}
                          type="button"
                          onClick={() => setModalImageIndex(idx)}
                          style={{
                            border:
                              idx === modalImageIndex
                                ? "2px solid #9333ea"
                                : "1px solid #e5e7eb",
                            borderRadius: "8px",
                            overflow: "hidden",
                            padding: 0,
                            width: "52px",
                            height: "52px",
                            cursor: "pointer",
                            background: "#fff",
                          }}
                        >
                          <img
                            src={img}
                            alt={`${selectedProduct.name} ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Trust badges */}
                  <div className="modal-trust">
                    <div className="modal-trust-item">
                      <Truck size={14} />
                      <span>Free Shipping</span>
                    </div>
                    <div className="modal-trust-item">
                      <RotateCcw size={14} />
                      <span>Easy Returns</span>
                    </div>
                    <div className="modal-trust-item">
                      <Shield size={14} />
                      <span>Authentic</span>
                    </div>
                  </div>
                </div>

                {/* Right – Details */}
                <div className="modal-info">
                  <div className="modal-info-top">
                    <span className="modal-category">
                      <Tag size={12} /> {selectedProduct.category || "Fashion"}
                    </span>
                    <button
                      className={`modal-wishlist-btn ${wishlistedItems.has(selectedProduct._id) ? "modal-wishlist-btn--active" : ""}`}
                      onClick={(e) => addToWishlist(selectedProduct, e)}
                      id="modal-wishlist-btn"
                    >
                      <Heart
                        size={16}
                        fill={
                          wishlistedItems.has(selectedProduct._id)
                            ? "#ef4444"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  <h2 className="modal-title">{selectedProduct.name}</h2>

                  {/* Rating */}
                  <div className="modal-rating">
                    {[...Array(5)].map((_, i) => {
                      const r = parseFloat(getRating(selectedProduct));
                      return (
                        <Star
                          key={i}
                          size={15}
                          fill={i < Math.round(r) ? "#f59e0b" : "none"}
                          color={i < Math.round(r) ? "#f59e0b" : "#d1d5db"}
                        />
                      );
                    })}
                    <span className="modal-rating-text">
                      {getRating(selectedProduct)} ·{" "}
                      {selectedProduct.reviews || "124"} reviews
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="modal-price-block">
                    <div className="modal-price-row">
                      <span className="modal-price">
                        Rs. {(selectedProduct.price || 0).toLocaleString()}
                      </span>
                      {selectedProduct.discountPercentage > 0 && (
                        <>
                          <span className="modal-price-orig">
                            Rs.{" "}
                            {Math.round(
                              (selectedProduct.price || 0) /
                                (1 - selectedProduct.discountPercentage / 100),
                            ).toLocaleString()}
                          </span>
                          <span className="modal-price-save">
                            Save Rs.{" "}
                            {(
                              Math.round(
                                (selectedProduct.price || 0) /
                                  (1 -
                                    selectedProduct.discountPercentage / 100),
                              ) - (selectedProduct.price || 0)
                            ).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="modal-tax-note">
                      Inclusive of all taxes · Free delivery above Rs. 1,999
                    </p>
                  </div>

                  <div className="modal-divider" />

                  {/* Description */}
                  <div className="modal-desc-block">
                    <h4 className="modal-section-label">Description</h4>
                    <p className="modal-desc">
                      {selectedProduct.description ||
                        `Premium quality ${selectedProduct.category || "fashion"} piece crafted with attention to detail. 
                        Made from high-quality materials ensuring comfort and durability for everyday wear. 
                        Perfect for casual and semi-formal occasions.`}
                    </p>
                  </div>

                  {/* Size Selector */}
                  <div className="modal-size-block">
                    <div className="modal-size-header">
                      <h4 className="modal-section-label">Select Size</h4>
                      <button
                        className="modal-size-guide"
                        onClick={() => setShowSizeGuide(true)}
                      >
                        <Ruler size={13} /> Size Guide
                      </button>
                    </div>
                    {showSizeGuide && (
                      <div
                        className="size-guide-overlay"
                        onClick={() => setShowSizeGuide(false)}
                      >
                        <div
                          className="size-guide-modal"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="size-guide-close"
                            onClick={() => setShowSizeGuide(false)}
                          >
                            ✕
                          </button>
                          <img
                            src={size_guide}
                            alt="Size Guide"
                            className="size-guide-image"
                          />
                        </div>
                      </div>
                    )}
                    <div className="modal-sizes">
                      {SIZES.map((sz) => (
                        <button
                          key={sz}
                          className={`modal-size-btn ${modalSize === sz ? "modal-size-btn--active" : ""}`}
                          onClick={() => setModalSize(sz)}
                          id={`modal-size-${sz}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="modal-qty-block">
                    <h4 className="modal-section-label">Quantity</h4>
                    <div className="modal-qty-control">
                      <button
                        className="modal-qty-btn"
                        onClick={() =>
                          setModalQuantity((q) => Math.max(1, q - 1))
                        }
                        id="modal-qty-dec"
                      >
                        −
                      </button>
                      <span className="modal-qty-value">{modalQuantity}</span>
                      <button
                        className="modal-qty-btn"
                        onClick={() => setModalQuantity((q) => q + 1)}
                        id="modal-qty-inc"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  {(selectedProduct.fabric ||
                    selectedProduct.material ||
                    selectedProduct.color) && (
                    <div className="modal-specs">
                      {selectedProduct.fabric && (
                        <div className="modal-spec">
                          <span>Fabric</span>
                          <span>{selectedProduct.fabric}</span>
                        </div>
                      )}
                      {selectedProduct.material && (
                        <div className="modal-spec">
                          <span>Material</span>
                          <span>{selectedProduct.material}</span>
                        </div>
                      )}
                      {selectedProduct.color && (
                        <div className="modal-spec">
                          <span>Color</span>
                          <span>{selectedProduct.color}</span>
                        </div>
                      )}
                      {selectedProduct.stock && (
                        <div className="modal-spec">
                          <span>Stock</span>
                          <span
                            className={
                              selectedProduct.stock < 10 ? "text-red-500" : ""
                            }
                          >
                            {selectedProduct.stock} left
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="modal-cta">
                    <button
                      className="modal-cta-cart"
                      onClick={handleModalAddToCart}
                      id="modal-add-to-cart-btn"
                    >
                      <ShoppingBag size={18} /> Add to Cart · Rs.{" "}
                      {(
                        (selectedProduct.price || 0) * modalQuantity
                      ).toLocaleString()}
                    </button>
                    <button
                      className="modal-cta-vto"
                      id="modal-vto-btn"
                      onClick={() => {
                        handleVtoImages(selectedProduct);
                        closeModal();
                        navigate("/vto");
                      }}
                    >
                      Virtual Try-On
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TOASTS ─── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="cat-toast cat-toast--cart"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <ShoppingBag size={18} />
            <span>Added to cart!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showWishlistToast && (
          <motion.div
            className="cat-toast cat-toast--wish"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <Heart size={18} />
            <span>Added to wishlist!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
