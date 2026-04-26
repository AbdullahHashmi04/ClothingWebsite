import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import CartContext from "../../Context/CartContext";
import { motion } from "framer-motion";
import { UserPlus, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import "../../../Style/Auth.css";

function SignUp() {
  const backendBaseUrl = (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.BACKEND_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();
  const Navigate = useNavigate();
  const { SetRegisterStatus } = useContext(CartContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [responseData, setResponseData] = useState("");

  const password = watch("Password");

  const onSubmit = async (data) => {
    try {
      await axios.post(`${backendBaseUrl}/signup`, data);
      SetRegisterStatus(true);
      Navigate("/");
    } catch (err) {
      setResponseData("Signup failed. Please review your details and try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backendBaseUrl}/googleLogin`;
  };

  return (
    <div className="auth-shell">
      <div className="w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="auth-card auth-card--signup"
        >
          <div className="auth-header">
            <div className="auth-badge">
              <UserPlus size={24} />
            </div>
            <h2 className="auth-title">
              Create account
            </h2>
            <p className="auth-subtitle">Join us and start shopping today</p>
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
            Sign up with Google
          </button>

          <div className="auth-divider" aria-hidden="true">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or</span>
            <div className="auth-divider-line" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="auth-field-grid auth-field-grid--two">
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-control-wrap">
                  <User className="auth-control-icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="auth-control"
                    {...register("Username", {
                      required: { value: true, message: "Name is required" },
                    })}
                  />
                </div>
                {errors.Username && (
                  <p className="auth-error">{errors.Username.message}</p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className="auth-control-wrap">
                  <Mail className="auth-control-icon" />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="auth-control"
                    {...register("Email", {
                      required: { value: true, message: "Email is required" },
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.Email && (
                  <p className="auth-error">{errors.Email.message}</p>
                )}
              </div>
            </div>

            <div className="auth-field-grid auth-field-grid--two">
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-control-wrap">
                  <Lock className="auth-control-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 7 characters"
                    className="auth-control auth-control--with-toggle"
                    {...register("Password", {
                      required: { value: true, message: "Password is required" },
                      minLength: { value: 7, message: "Min length is 7 characters" },
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

              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-control-wrap">
                  <Lock className="auth-control-icon" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    className="auth-control auth-control--with-toggle"
                    {...register("ConfirmPassword", {
                      required: { value: true, message: "Please confirm your password" },
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="auth-toggle"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.ConfirmPassword && (
                  <p className="auth-error">{errors.ConfirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="auth-field-grid auth-field-grid--two">
              <div className="auth-field">
                <label className="auth-label">
                  Phone <span className="auth-label-optional">(Optional)</span>
                </label>
                <div className="auth-control-wrap">
                  <input
                    type="tel"
                    placeholder="+92 (555) 123-4567"
                    {...register("Phone", {
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                    className="auth-control"
                  />
                </div>
                {errors.Phone && (
                  <p className="auth-error">{errors.Phone.message}</p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  Address <span className="auth-label-optional">(Optional)</span>
                </label>
                <div className="auth-control-wrap">
                  <input
                    type="text"
                    placeholder="Enter your address"
                    {...register("Address")}
                    className="auth-control"
                  />
                </div>
                {errors.Address && (
                  <p className="auth-error">{errors.Address.message}</p>
                )}
              </div>
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {errors.myform && (
              <p className="auth-error">{errors.myform.message}</p>
            )}
            {errors.blocked && (
              <p className="auth-error">{errors.blocked.message}</p>
            )}
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
            Already have an account?
            <Link
              to="/login"
              className="auth-footer-link"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SignUp;
