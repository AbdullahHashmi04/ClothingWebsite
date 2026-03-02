import React, { useState, useContext } from "react";
import CartContext from "../Context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Package } from "lucide-react";
import "../../Style/Catalog.css";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "men", "women", "kids"];

export default function ClothingCatalog() {
  const { addToCart, mycategory, setCategory, catalogData, addVtoImage } = useContext(CartContext);
  const [showToast, setShowToast] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(mycategory || "All");

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


  return (
    <div className="catalog-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                  { console.log(item.imageUrl) }

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="catalog-product-card"
                    >
                      <div className="catalog-product-image-wrapper">
                        <img
                          src={item.imageUrl}
                          alt={item.title || item.name}
                          className="max-h-full object-contain"
                        />
                        <div className="catalog-product-overlay"></div>
                        <Link to="/vto">
                          <button
                            onClick={() => { handleVtoImages(item) }}
                            className={`catalog-product-wishlist animate-puls`}>
                            <h2 className="font-bold">Try</h2>
                          </button>
                        </Link>
                      </div>

                      <div className="catalog-product-content">
                        <h2 className="catalog-product-title">
                          {item.title || item.name}
                        </h2>
                        <p className="catalog-product-category">{item.category}</p>

                        <div className="catalog-product-footer">
                          <div className="catalog-product-price-container">
                            <span className="catalog-product-price">
                              ${price}
                            </span>
                            {discount && (
                              <span className="catalog-product-discount">
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
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
        </motion.div>
      </div>
    </div>
  );
}
