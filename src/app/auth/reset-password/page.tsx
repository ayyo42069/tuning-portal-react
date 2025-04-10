"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowRight,
  Home,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      // Clear form data after successful reset
      setFormData({
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* SVG Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "30px",
            filter: "blur(0.5px)",
          }}
        ></div>
      </div>

      {/* Circuit board pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/circuit-board.svg')",
            backgroundSize: "300px",
          }}
        ></div>
      </div>

      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div
          initial={{ x: -100, opacity: 0.2 }}
          animate={{ x: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 -top-64 -left-64 will-change-transform"
        />
        <motion.div
          initial={{ x: 100, opacity: 0.2 }}
          animate={{ x: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 top-1/3 -right-64 will-change-transform"
        />
        <motion.div
          initial={{ y: 100, opacity: 0.2 }}
          animate={{ y: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 -bottom-32 left-1/3 will-change-transform"
        />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm p-8 rounded-xl border border-white/20 shadow-xl">
        <div>
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-white/70">
            Enter your new password below
          </p>
        </div>

        {tokenError ? (
          <div className="rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-500/20 p-6 mb-4 shadow-lg text-center">
            <div className="flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-xl font-medium text-red-300 mb-2">
                Invalid Reset Link
              </h3>
              <p className="text-sm text-red-200/80 mb-6">{tokenError}</p>
              <Link
                href="/auth/forgot-password"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-blue-500/25 transition-all duration-200"
              >
                Request New Reset Link
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="rounded-lg bg-green-500/10 backdrop-blur-sm border border-green-500/20 p-6 mb-4 shadow-lg text-center">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-xl font-medium text-green-300 mb-2">
                Password Reset Successful
              </h3>
              <p className="text-sm text-green-200/80 mb-6">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>
              <Link
                href="/auth/login"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-green-500/25 transition-all duration-200"
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="sr-only">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="New password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full pl-10 pr-10 px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-500/20 p-4 mb-4 shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <Loader2 className="h-5 w-5 text-white/80 animate-spin" />
                  ) : (
                    <Lock className="h-5 w-5 text-white/80" />
                  )}
                </span>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-center mt-6">
          <Link
            href="/auth/login"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors mr-4"
          >
            Back to Login
          </Link>
          <Link
            href="/"
            className="flex items-center text-sm text-white/70 hover:text-white transition-colors group"
          >
            <div className="bg-white/10 p-1.5 rounded-full mr-2 group-hover:bg-white/20 transition-colors">
              <Home className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
            </div>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
