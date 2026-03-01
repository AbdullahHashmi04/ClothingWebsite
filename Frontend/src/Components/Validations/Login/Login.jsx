/* eslint-disable no-undef */
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import CartContext from "../../Context/CartContext";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [responseData, setResponseData] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const { setLoginStatus, setUserInfo } = useContext(CartContext);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/googleLogin";
  };

  const onSubmit = async (data) => {
    try {
      console.log("Submitting login with data:", data);
      if (data.Email === "admin@admin.com" && data.Password === "admin123") {
        navigate("/admin");
        return;
      }
      const res = await axios.post("http://localhost:3000/login", data);
      setLoginStatus(true);
      console.log("Login successful:", res.data);
      setUserInfo(res.data.query);
      navigate("/");
    } catch (err) {
      setResponseData("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-slate-50 via-purple-50/40 to-pink-50/30" style={{ minHeight: 'calc(100vh - 5rem)' }}>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-md"
          style={{ maxWidth: '420px' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 mb-5">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-md transition-all duration-200 group"
            style={{ minHeight: '48px' }}
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                {/* <User className="absolute left-3.5 top-1/2  justify-en -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" /> */}
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200"
                  style={{ minHeight: '48px' }}
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
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.Email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                {/* <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" /> */}
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200"
                  style={{ minHeight: '48px' }}
                  {...register("Password", {
                    required: { value: true, message: "Password is required" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.Password && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.Password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ minHeight: '48px' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Response message */}
          {responseData && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-5 p-3.5 rounded-xl text-center text-sm font-medium 
                 "bg-green-50 text-green-700 border border-green-200"
                // : "bg-red-50 text-red-600 border border-red-200"
                }`}
            >
              {responseData}
            </motion.div>
          )}

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
