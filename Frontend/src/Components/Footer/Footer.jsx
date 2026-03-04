import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import "../../Style/Sections.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="footer-brand"
        >
          <h2 className="footer-logo">
            Smartify
          </h2>
          <p className="footer-description">
            Your one-stop destination for trendy clothing, premium quality, and unmatched style.
            Elevate your wardrobe with our curated collections.
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/absurdhashmi/" className="footer-social-link" aria-label="Instagram">
              <Instagram className="footer-social-icon" />
            </a>
            <a href="https://www.facebook.com/abdullahhashmi136" className="footer-social-link" aria-label="Facebook">
              <Facebook className="footer-social-icon" />
            </a>
            <a href="https://x.com/hashmi486" className="footer-social-link" aria-label="Twitter">
              <Twitter className="footer-social-icon" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="footer-column-title">Shop</h3>
          <ul className="footer-links">
            <li><Link to="/catalog" className="footer-link">Men's Collection</Link></li>
            <li><Link to="/catalog" className="footer-link">Women's Collection</Link></li>
            <li><Link to="/catalog" className="footer-link">Kids Collection</Link></li>
            <li><Link to="/catalog" className="footer-link">New Arrivals</Link></li>
            <li><Link to="/catalog" className="footer-link">Sale</Link></li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="footer-column-title">Customer Support</h3>
          <ul className="footer-links">
            <li><Link to="/about" className="footer-link">About Us</Link></li>
            <li><a href="https://wa.me/923135028253" className="footer-link">Contact Us</a></li>
            <li><Link to="/userDashboard/orders" className="footer-link">Shipping Info</Link></li>
            <li><Link to="/userDashboard/returns" className="footer-link">Returns & Refunds</Link></li>
            <li><Link to="/feedback" className="footer-link">Feedback</Link></li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="footer-column-title">Contact</h3>
          <ul className="footer-links">
            <li className="footer-contact-item">
              <MapPin className="footer-contact-icon" />
              <span>123 Fashion Street, Rawalpindi, SC 12345</span>
            </li>
            <li className="footer-contact-item">
              <Phone className="footer-contact-icon" />
              <span>+92 313-5028253</span>
            </li>
            <li className="footer-contact-item">
              <Mail className="footer-contact-icon" />
              <span>kennethjohn.miranda08.kjm@gmail.com</span>
            </li>
          </ul>
        </motion.div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          © {new Date().getFullYear()} Smartify. All Rights Reserved. Made with ❤️ for fashion lovers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
