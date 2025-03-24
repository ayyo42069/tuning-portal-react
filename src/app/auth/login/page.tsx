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
      // First try to use the AuthProvider's login function
      const loginSuccess = await login(formData.username, formData.password);

      if (loginSuccess) {
        // Redirect to dashboard on successful login
        router.push("/dashboard");
      } else {
        // If login failed but no error was set, it might be a verification issue
        // We'll make a direct API call to check for verification requirements
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
          setError(""); // Clear general error when showing the verification alert
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
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
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
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full pl-10 px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
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
      </div>
    </div>
  );
}
