/* eslint-disable no-undef */
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import CartContext from "../../Context/CartContext";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Mail, Lock } from "lucide-react";
import "../../../Style/Auth.css";

export default function LoginPage() {
  const [responseData, setResponseData] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const backendBaseUrl = (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.BACKEND_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const { setLoginStatus, setUserInfo } = useContext(CartContext);

  const handleGoogleLogin = () => {
    window.location.href = `${backendBaseUrl}/googleLogin`;
  };
  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${backendBaseUrl}/login`, data);

      const { token } = res.data;
      const { query } = res.data;

      localStorage.setItem("token", token);
      setUserInfo(query);
      setLoginStatus(true);

      if (query.role === "admin") {
        navigate("/admin");
        return;
      }

      navigate("/");
    } catch (err) {
      setResponseData("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="auth-card"
        >
          <div className="auth-header">
            <div className="auth-badge">
              <LogIn size={24} />
            </div>
            <h2 className="auth-title">
              Welcome back
            </h2>
            <p className="auth-subtitle">
              Sign in to your account to continue
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="auth-google-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider" aria-hidden="true">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or</span>
            <div className="auth-divider-line" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">
                Email
              </label>
              <div className="auth-control-wrap">
                <Mail className="auth-control-icon" />
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="auth-control"
                  {...register("Email", {
                    required: { value: true, message: "Email is required" },
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.Email && (
                <p className="auth-error">{errors.Email.message}</p>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Password
              </label>
              <div className="auth-control-wrap">
                <Lock className="auth-control-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="auth-control auth-control--with-toggle"
                  {...register("Password", {
                    required: { value: true, message: "Password is required" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.Password && (
                <p className="auth-error">{errors.Password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-submit"
            >
              {isSubmitting ? (
                <span className="auth-submit-content">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {responseData && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="auth-feedback"
            >
              {responseData}
            </motion.div>
          )}

          <p className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="auth-footer-link"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
