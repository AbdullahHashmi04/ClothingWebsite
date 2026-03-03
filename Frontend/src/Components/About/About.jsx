import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Heart, Zap, Award, Users, User } from "lucide-react";
import "../../Style/About.css";

const About = () => {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Recommendations",
      desc: "Personalized outfit suggestions using machine learning."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Trend Analysis",
      desc: "Stay ahead with real-time fashion trend insights."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Dashboard",
      desc: "Track your preferences and shopping history."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User-Centric Design",
      desc: "Minimal, fast, and responsive UI experience."
    }
  ];

  return (
    <div className="about-page">
      <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="about-header"
        >
          <div className="about-header-icon">
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="about-title">
            About <span className="about-title-gradient">Smartify</span>
          </h1>
          <p className="about-subtitle">
            Where fashion meets innovation
          </p>
        </motion.div>

        <div className="about-content-section">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="about-text-content"
          >
            <h2 className="about-section-title">
              Smart Fashion for Everyone
            </h2>
            <p className="about-section-text">
              Our platform analyzes user preferences, browsing behavior, and trends
              to recommend outfits that truly match your style. From casual wear to
              premium collections, we ensure every suggestion feels personal, modern, and confident.
            </p>
            <p className="about-section-text">
              We believe fashion should be accessible, enjoyable, and tailored to your
              unique personality. Our curated collections feature the latest trends while
              maintaining timeless elegance.
            </p>
            <div className="about-stats">
              <div className="about-avatars">
                {[
                  { id: 1, name: "Sarah", color: "from-purple-400 to-pink-400" },
                  { id: 2, name: "Mike", color: "from-blue-400 to-purple-400" },
                  { id: 3, name: "Emma", color: "from-pink-400 to-rose-400" },
                  { id: 4, name: "Alex", color: "from-purple-500 to-indigo-500" }
                ].map((customer, i) => (
                  <div
                    key={customer.id}
                    className={`about-avatar about-avatar-gradient bg-gradient-to-br ${customer.color}`}
                    title={customer.name}
                  >
                    <User className="about-avatar-icon" />
                  </div>
                ))}
              </div>
              <div className="about-stats-text">
                <p className="about-stats-number">10,000+ Happy Customers</p>
                <p className="about-stats-label">Join our fashion community</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="about-image-wrapper"
          >
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
              alt="Fashion Store"
              className="about-image"
            />
            <div className="about-image-overlay"></div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="about-features-section"
        >
          <h2 className="about-features-title">
            Why Choose Smartify?
          </h2>
          <div className="about-features-grid">
            {features.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="about-feature-card"
              >
                <div className="about-feature-icon">
                  {item.icon}
                </div>
                <h3 className="about-feature-title">
                  {item.title}
                </h3>
                <p className="about-feature-desc">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="about-mission-section"
        >
          <Award className="about-mission-icon" />
          <h2 className="about-mission-title">
            Redefining Online Fashion
          </h2>
          <p className="about-mission-text">
            Our mission is to blend technology and style to create a smarter,
            faster, and more personalized shopping experience for everyone.
            Join thousands of satisfied customers who trust Smartify for their fashion needs.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
