import React, { useState, useContext } from "react";
import CartContext from "../Context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart,Star, TrendingUp,Search, Package } from "lucide-react";
import "../../Style/Catalog.css";
import { Link } from "react-router-dom";
import axios from "axios";

const CATEGORIES = ["All", "shirts", "pants", "accessories", "dresses"];

export default function ClothingCatalog() {
  const { addToCart, mycategory, setCategory, catalogData, addVtoImage } = useContext(CartContext);
  const [showToast, setShowToast] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(mycategory || "All");
  const {user} = useContext(CartContext);
  const [showWishlistToast, setShowWishlistToast] = useState(false);

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      name: product.title || product.name,
      img: product.image || product.images?.[0] || product.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + product.id}?w=400&h=500&fit=crop`,
      price: product.price || Math.floor(Math.random() * 200) + 20
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };
  const handleVtoImages = (product) => {
    addVtoImage({
      ...product,
      name: product.title || product.name,
      img: product.image || product.images?.[0] || product.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + product.id}?w=400&h=500&fit=crop`,
      price: product.price || Math.floor(Math.random() * 200) + 20
    });
  };

  const filteredProducts = catalogData.filter((p) => {
    const matchesQuery = (p.title || p.name || "").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesQuery && matchesCategory;
  });

  const addToWishlist = async (item) => {
      if (user && user.Email) {
        try {
          await axios.post("http://localhost:3000/wishlist/add", {
            Email: user.Email,
            product: {
              _id: item._id,
              name: item.name,
              price: item.price,
              imageUrl: item.imageUrl,
            },
          });
          setShowWishlistToast(true);
          setTimeout(() => {
            setShowWishlistToast(false);
          }, 2000);
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


  return (
    <div className="catalog-page">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="catalog-header">
            <h1 style={{
              fontFamily: "'Playfair Display',Georgia,serif",
              fontSize: "clamp(28px,5vw,52px)",
              fontWeight: 900,
              color: "#1a0a2e",
              margin: "0 0 12px",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}>
              Our{" "}
              <span style={{
                background: "linear-gradient(135deg,#9333ea 0%,#ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Catalog
              </span>
            </h1>

            <p className="catalog-subtitle">Discover your perfect style</p>
          </div>

          <div className="catalog-filters">
            <div className="catalog-search-wrapper">
              <Search className="catalog-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                className="catalog-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="catalog-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);

                    setCategory(cat === "All" ? "" : cat);
                  }}
                  className={`catalog-category-button ${selectedCategory === cat
                    ? "catalog-category-button-active"
                    : "catalog-category-button-inactive"
                    }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="catalog-empty-state"
              >
                <Package className="catalog-empty-icon" />
                <p className="catalog-empty-text">No products found.</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="catalog-products-grid"
              >
                {filteredProducts.map((item, index) => {
                  const price = item.price || Math.floor(Math.random() * 200) + 20;
                  const discount = item.discountPercentage ? Math.round(item.discountPercentage) : null;
                  return (
                    <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <div className="product-card">
                    <div className="product-card-image-container">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="product-card-image"
                      />
                      <div className="product-card-badge animate-pulse">Vto</div>

                      {/* Quick Actions */}
                      <div className="product-card-quick-actions">
                        <button
                          className="product-card-quick-action-btn"
                          aria-label="Quick view"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Hover Overlay */}
                      <div className="product-card-overlay">
                        <div className="product-card-overlay-content">
                          <p className="product-card-overlay-title">
                            {item.title}
                          </p>
                          <div className="product-card-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            <span className="product-card-rating-text">
                              (4.8)
                            </span>
                          </div>
                          <div className="product-card-overlay-footer">
                            <span className="product-card-overlay-price">
                              ${price}
                            </span>
                            <button
                              className="product-card-overlay-button"
                              aria-label="Add to cart"
                            >
                              <ShoppingBag className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="product-card-content">
                      <p className="product-card-title">{item.name}</p>
                      <div className="product-card-footer">
                        <div className="product-card-price-container">
                          <span className="product-card-price">Rs.{item.price}</span>
                          <span className="product-card-price-original">
                            Rs./{item.originalPrice}
                          </span>
                          {discount > 0 && (
                            <span className="product-card-discount">
                              -{discount}%
                            </span>
                          )}
                        </div>
                        <button
                          className="catalog-product-add-button"
                          onClick={() => handleAddToCart(item)}
                          aria-label="Add to cart"
                        >
                          <ShoppingBag className="catalog-product-add-icon" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                        <button
                          className="product-card-wishlist"
                          aria-label="Add to wishlist"
                          onClick={() => addToWishlist(item)}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>)})}
              </motion.div>
            )}

          </AnimatePresence>

          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="catalog-toast"
              >
                <ShoppingBag className="catalog-toast-icon" />
                <span className="catalog-toast-text">Added to cart!</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showWishlistToast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="catalog-toast"
              >
                <Heart className="catalog-toast-icon" />
                <span className="catalog-toast-text">Added to Wishlist!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
