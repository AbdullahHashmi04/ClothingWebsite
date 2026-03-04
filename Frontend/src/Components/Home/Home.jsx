import { useState, useEffect, useContext, useRef } from "react";
import {
  ChevronLeft, ChevronRight, ShoppingBag, Sparkles,
  TrendingUp, Heart, Star, Award, Truck, Shield,
  RefreshCw, Users, CheckCircle, ArrowRight, Zap, Gift,
} from "lucide-react";
import { motion ,AnimatePresence} from "framer-motion";
import CartContext from "../Context/CartContext";
import { Link } from "react-router-dom";
import "../../Style/FeaturedProducts.css";
import "../../Style/ProductCard.css";
import "../../Style/PremiumCollection.css";
import "../../Style/Sections.css";
import "../../Style/ViewAllButton.css";
import "../../Style/HeroSection.css";
import axios from 'axios'

const slides = [
  {
    type: "image",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
    title: "Elevate Your Style",
    subtitle: "Discover premium fashion that defines you",
    gradient: "from-black/70 via-purple-900/60 to-black/70",
  },
  {
    type: "image",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    title: "New Collection",
    subtitle: "Trending styles for every occasion",
    gradient: "from-black/70 via-blue-900/60 to-black/70",
  },
  {
    type: "image",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80",
    title: "Fashion Forward",
    subtitle: "Where elegance meets innovation",
    gradient: "from-black/70 via-rose-900/60 to-black/70",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { mydata, setCategory, addToCart , user } = useContext(CartContext);
  const [showWishlistToast, setShowWishlistToast] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // const nextSlide = () => {
  //   setCurrentSlide((prev) => (prev + 1 - slides.length) % slides.length);
  // };

  // const prevSlide = () => {
  //   setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  // };

  const setCatalog = (data) => {
    setCategory(data);
  };


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

  const handleAddToCart = (item) => {
    addToCart(item)
  }
  return (
    <div className="w-full overflow-x-hidden">
      <div className="hero-section">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 1 }}
            className={`hero-slide ${index === currentSlide
              ? "hero-slide-active"
              : "hero-slide-inactive"
              }`}
          >
            <div className="hero-image-container">
              <img src={slide.img} alt={slide.title} className="hero-image" />
              <div className="hero-overlay"></div>
            </div>

            <div className="hero-content">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hero-text-container"
              >
                <div className="hero-badge">
                  <Sparkles className="w-4 h-4" />
                  New Collection
                </div>

                <h1 className="hero-title">
                  {slide.title === "Elevate Your Style" ? (
                    <>
                      Elevate Your{" "}
                      <span className="hero-title-gradient">Style</span>
                    </>
                  ) : slide.title === "New Collection" ? (
                    <>
                      New{" "}
                      <span className="hero-title-gradient">Collection</span>
                    </>
                  ) : (
                    <>
                      Fashion{" "}
                      <span className="hero-title-gradient">Forward</span>
                    </>
                  )}
                </h1>

                <p className="hero-subtitle">{slide.subtitle}</p>

                <div className="hero-button-wrapper">
                  <Link to="/catalog">
                    <button className="hero-button">
                      <span className="hero-button-content">
                        <ShoppingBag className="hero-button-icon" />
                        <span>Shop Now</span>
                      </span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}

        {/* <button
          onClick={prevSlide}
          className="hero-nav-button hero-nav-button-prev"
          aria-label="Previous slide"
        >
          <ChevronLeft className="hero-nav-icon" />
        </button>

        <button
          onClick={nextSlide}
          className="hero-nav-button hero-nav-button-next"
          aria-label="Next slide"
        >
          <ChevronRight className="hero-nav-icon" />
        </button> */}

        <div className="hero-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`hero-indicator ${index === currentSlide ? "hero-indicator-active" : ""
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="relative w-full py-20 bg-gradient-to-b from-white via-purple-50/20 to-white">
        <div className="w-auto mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="featured-products-badge">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="featured-products-badge-text">
                Handpicked Selection
              </span>
            </div>
            <h2 className="featured-products-heading">Featured Products</h2>
            <p className="featured-products-description">
              Discover our most popular and trending items, carefully selected
              for quality and style
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {mydata.slice(0, 8).map((item, index) => {
              const price = item.price || Math.floor(Math.random() * 200) + 20;
              const originalPrice = Math.floor(price * 1.3);
              const discount = Math.round(
                ((originalPrice - price) / originalPrice) * 100
              );

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
                      <div className="product-card-badge">New</div>

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
                              Rs.{price}
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
                            Rs.{item.originalPrice}
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
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="view-all-products-button-wrapper"
          >
            <Link to="/catalog">
              <button className="view-all-products-button">
                <span className="view-all-products-button-content">
                  <span className="view-all-products-button-text">
                    View All Products
                  </span>
                  <ArrowRight className="view-all-products-button-icon" />
                </span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="premium-collection-section">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="premium-collection-badge">
                <div className="premium-collection-badge-icon">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="premium-collection-badge-text">
                  Premium Collection
                </span>
              </div>

              <h1 className="premium-collection-heading">
                Elevate Your{" "}
                <span className="premium-collection-heading-gradient">
                  Style
                </span>
              </h1>

              <p className="premium-collection-description">
                Discover the latest fashion trends, premium quality wear, and
                outfits designed to make you stand out. Curated collections for
                every occasion.
              </p>

              <div className="premium-collection-features">
                {[
                  "Premium Quality Materials",
                  "Trending Fashion Designs",
                  "Curated by Style Experts",
                  "Perfect for Every Occasion",
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="premium-collection-feature"
                  >
                    <div className="premium-collection-feature-icon">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="premium-collection-feature-text">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="premium-collection-actions">
                <Link
                  to="/catalog"
                  onClick={() => {
                    setCatalog("");
                  }}
                >
                  <button className="premium-collection-button-primary">
                    <ShoppingBag className="w-5 h-5" />
                    Shop Now
                  </button>
                </Link>
                <Link to="/about">
                  <button className="premium-collection-button-secondary">
                    <span>Learn More</span>
                  </button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="premium-collection-image-container"
            >
              <div className="premium-collection-image-wrapper">
                <div className="premium-collection-image-glow"></div>
                <img
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=800&fit=crop"
                  alt="Fashion Model"
                  className="premium-collection-image"
                />
                <div className="premium-collection-image-badge">
                  <div className="premium-collection-image-badge-content">
                    <Award className="w-6 h-6 text-yellow-500" />
                    <div>
                      <div className="premium-collection-image-badge-number">
                        10K+
                      </div>
                      <p className="premium-collection-image-badge-text">
                        Happy Customers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="why-choose-section">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="why-choose-header">
              <h2 className="why-choose-title">
                Why Choose {" "}
                <span className="why-choose-title-gradient">Smartify</span>?
              </h2>
              <p className="why-choose-subtitle">
                Experience the difference with our premium services
              </p>
            </div>
            <div className="why-choose-grid">
              {[
                {
                  icon: Truck,
                  title: "Free Shipping",
                  desc: "On orders over $50",
                },
                {
                  icon: Shield,
                  title: "Secure Payment",
                  desc: "100% secure transactions",
                },
                {
                  icon: RefreshCw,
                  title: "Easy Returns",
                  desc: "30-day return policy",
                },
                {
                  icon: Award,
                  title: "Premium Quality",
                  desc: "Curated by experts",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="why-choose-card"
                >
                  <div className="why-choose-icon-wrapper">
                    <item.icon className="why-choose-icon" />
                  </div>
                  <h3 className="why-choose-card-title">{item.title}</h3>
                  <p className="why-choose-card-desc">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="stats-section">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="stats-grid">
              {[
                { number: "50K+", label: "Happy Customers" },
                { number: "10K+", label: "Products" },
                { number: "500+", label: "5-Star Reviews" },
                { number: "24/7", label: "Support" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="stats-item"
                >
                  <div className="stats-number">{stat.number}</div>
                  <div className="stats-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="collections-section">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="collections-header">
              <h2 className="collections-title">
                Explore Our{" "}
                <span className="collections-title-gradient">Collections</span>
              </h2>
              <p className="collections-subtitle">
                Shop by category and find your perfect style
              </p>
            </div>

            <div className="collections-grid">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="collection-card">
                <Link to="/catalog" onClick={() => setCatalog("men")}>
                  <div className="collection-image-container">
                    <img
                      src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=400&fit=crop"
                      alt="Men's Collection"
                      className="collection-image"
                    />
                    <div className="collection-overlay"></div>
                    <div className="collection-content">
                      <h3 className="collection-title">Men</h3>
                      <p className="collection-link">Explore Collection →</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="collection-card"
              >
                <Link to="/catalog" onClick={() => setCatalog("women")}>
                  <div className="collection-image-container">
                    <img
                      src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop"
                      alt="Women's Collection"
                      className="collection-image"
                    />
                    <div className="collection-overlay"></div>
                    <div className="collection-content">
                      <h3 className="collection-title">Women</h3>
                      <p className="collection-link">Explore Collection →</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="collection-card"
              >
                <Link to="/catalog" onClick={() => setCatalog("kid")}>
                  <div className="collection-image-container">
                    <img
                      src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop"
                      alt="Kids Collection"
                      className="collection-image"
                    />
                    <div className="collection-overlay"></div>
                    <div className="collection-content">
                      <h3 className="collection-title">Kids</h3>
                      <p className="collection-link">Explore Collection →</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
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

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="testimonials-header">
              <h2 className="testimonials-title">
                What Our{" "}
                <span className="testimonials-title-gradient">Customers</span>{" "}
                Say
              </h2>
              <p className="testimonials-subtitle">
                Don't just take our word for it
              </p>
            </div>
            <div className="testimonials-grid">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Fashion Enthusiast",
                  text: "Amazing quality and fast shipping! The clothes fit perfectly and the style is exactly what I was looking for.",
                  rating: 5,
                },
                {
                  name: "Michael Chen",
                  role: "Style Blogger",
                  text: "Smartify has become my go-to for all fashion needs. Their curated collections are always on point!",
                  rating: 5,
                },
                {
                  name: "Emily Davis",
                  role: "Regular Customer",
                  text: "Best online shopping experience ever! Great prices, excellent customer service, and beautiful products.",
                  rating: 5,
                },
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="testimonial-card"
                >
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4  fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar"></div>
                    <div className="testimonial-info">
                      <div className="testimonial-name">{testimonial.name}</div>
                      <div className="testimonial-role">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      {/* <section className="newsletter-section">
        <div className="newsletter-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="newsletter-card">
              <div className="newsletter-background">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>
              <div className="newsletter-content">
                <Gift className="newsletter-icon" />
                <h2 className="newsletter-title">Stay in Style</h2>
                <p className="newsletter-description">
                  Subscribe to our newsletter and get exclusive deals, new
                  arrivals, and style tips delivered to your inbox.
                </p>
                <form className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="newsletter-input"
                  />
                  <button type="submit" className="newsletter-button">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
}
