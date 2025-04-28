"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  LogIn,
  Home,
  Loader2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import DynamicIsland from "@/components/DynamicIsland";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
    setShowVerificationAlert(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const loginSuccess = await login(formData.username, formData.password);

      if (loginSuccess) {
        router.push("/dashboard");
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.status === 403 && data.emailVerificationRequired) {
          setShowVerificationAlert(true);
          setUnverifiedEmail(data.email);
          setError("");
        } else {
          throw new Error(data.error || "Login failed");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendingEmail) return;

    setResendingEmail(true);
    setResendSuccess(false);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: unverifiedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Island */}
      <DynamicIsland variant="auth" />

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div
          initial={{ x: -100, opacity: 0.2 }}
          animate={{ x: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 -top-64 -left-64 will-change-transform filter blur-3xl"
        />
        <motion.div
          initial={{ x: 100, opacity: 0.2 }}
          animate={{ x: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 top-1/3 -right-64 will-change-transform filter blur-3xl"
        />
        <motion.div
          initial={{ y: 100, opacity: 0.2 }}
          animate={{ y: 0, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 -bottom-32 left-1/3 will-change-transform filter blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10 bg-white/5 dark:bg-gray-900/20 backdrop-blur-sm p-8 rounded-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/15 dark:hover:bg-gray-900/30"
      >
        <div>
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-white/70">
            Or{" "}
            <Link
              href="/auth/register"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white/80 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-transparent focus:z-10 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] sm:text-sm transition-all duration-200"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full pl-10 px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-transparent focus:z-10 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] sm:text-sm transition-all duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center flex items-center justify-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}

          {showVerificationAlert && (
            <div className="rounded-lg bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 p-4 mb-4 shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-300">
                    Please verify your email address before logging in.
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-yellow-300/80">
                      A verification email was sent to{" "}
                      <span className="font-medium text-yellow-200">
                        {unverifiedEmail}
                      </span>
                      .
                      {resendSuccess && (
                        <span className="block mt-1 text-green-400">
                          Verification email resent successfully!
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-yellow-500/25 transition-all duration-200"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend verification email"
                      )}
                    </button>
                  </div>
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
                  <LogIn className="h-5 w-5 text-white/80" />
                )}
              </span>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        <div className="flex items-center justify-center mt-6">
          <Link
            href="/"
            className="flex items-center text-sm text-white/70 hover:text-white transition-colors group"
          >
            <div className="bg-white/10 p-1.5 rounded-full mr-2 group-hover:bg-white/20 transition-colors">
              <Home className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
            </div>
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
