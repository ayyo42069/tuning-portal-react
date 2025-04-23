"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createRoot } from "react-dom/client";
import {
  User,
  Mail,
  UserRound,
  Lock,
  Loader2,
  ArrowLeft,
  Home,
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  X,
} from "lucide-react";
import DOMPurify from 'dompurify';

// Password strength criteria
const CRITERIA = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

// Email validation regex - prevents unicode spoofing
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Username validation regex - alphanumeric with limited special chars
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,20}$/;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [enteredVerificationCode, setEnteredVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
    tap: { scale: 0.97 },
  };

  // Collect device information for fingerprinting
  useEffect(() => {
    const collectDeviceInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        colorDepth: window.screen.colorDepth,
        platform: navigator.platform,
        doNotTrack: navigator.doNotTrack,
        cookiesEnabled: navigator.cookieEnabled,
        timestamp: new Date().toISOString(),
      };
      setDeviceInfo(info);
    };

    collectDeviceInfo();
  }, []);

  const validatePassword = (password: string) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= CRITERIA.minLength) {
      strength += 1;
    } else {
      feedback.push(`At least ${CRITERIA.minLength} characters`);
    }

    if (CRITERIA.hasUppercase.test(password)) {
      strength += 1;
    } else {
      feedback.push("At least one uppercase letter");
    }

    if (CRITERIA.hasLowercase.test(password)) {
      strength += 1;
    } else {
      feedback.push("At least one lowercase letter");
    }

    if (CRITERIA.hasNumber.test(password)) {
      strength += 1;
    } else {
      feedback.push("At least one number");
    }

    if (CRITERIA.hasSpecialChar.test(password)) {
      strength += 1;
    } else {
      feedback.push("At least one special character");
    }

    return { strength, feedback };
  };

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validateUsername = (username: string) => {
    if (!username) return "Username is required";
    if (!USERNAME_REGEX.test(username))
      return "Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate fields on change
    if (name === "password") {
      const { strength, feedback } = validatePassword(value);
      setPasswordStrength(strength);
      setValidationErrors((prev) => ({
        ...prev,
        password: feedback.length > 0 ? feedback.join(", ") : "",
      }));

      // Also validate confirm password if it exists
      if (formData.confirmPassword) {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword:
            value !== formData.confirmPassword ? "Passwords do not match" : "",
        }));
      }
    } else if (name === "confirmPassword") {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.password ? "Passwords do not match" : "",
      }));
    } else if (name === "email") {
      setValidationErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "username") {
      setValidationErrors((prev) => ({
        ...prev,
        username: validateUsername(value),
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: passwordStrength < 3 ? "Password is not strong enough" : "",
      confirmPassword:
        formData.password !== formData.confirmPassword
          ? "Passwords do not match"
          : "",
    };

    setValidationErrors(errors);

    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("You must accept the Terms of Service to register");
      return;
    }

    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Include device fingerprinting data with registration
      const registrationData = {
        ...formData,
        deviceInfo,
      };

      // Remove confirmPassword as it's not needed on the server

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Show verification modal instead of redirecting
      setRegisteredEmail(formData.email);

      // Extract token from the response if available
      if (data.verificationToken) {
        setVerificationToken(data.verificationToken);
      }

      setShowVerificationModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200 dark:bg-gray-700";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated elements */}
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
        {showTerms && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Terms and Conditions</h2>
              {termsContent ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(termsContent) }}
                />
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading terms...
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTerms(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full mx-auto space-y-8 relative z-10 bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm p-8 rounded-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/15 dark:hover:bg-gray-900/30"
      >
        <motion.div variants={itemVariants}>
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 mb-4">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <motion.h2
            variants={itemVariants}
            className="mt-4 text-center text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
          >
            Create a new account
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-center text-sm text-white/70"
          >
            Or{" "}
            <Link
              href="/auth/login"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              sign in to your existing account
            </Link>
          </motion.p>
        </motion.div>

        <motion.form
          variants={itemVariants}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`appearance-none relative block w-full pl-10 px-4 py-3 border ${
                    validationErrors.username
                      ? "border-red-500/50"
                      : "border-white/20"
                  } bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/70 focus:border-transparent focus:z-10 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] sm:text-sm transition-all duration-200`}
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`appearance-none relative block w-full pl-10 px-4 py-3 border ${
                    validationErrors.email
                      ? "border-red-500/50"
                      : "border-white/20"
                  } bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="appearance-none relative block w-full pl-10 px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200"
                  placeholder="Full Name (optional)"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`appearance-none relative block w-full pl-10 px-4 py-3 border ${
                    validationErrors.password
                      ? "border-red-500/50"
                      : "border-white/20"
                  } bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                    <div
                      className={`h-2.5 rounded-full ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      Password strength: {getPasswordStrengthText()}
                    </span>
                    {passwordStrength >= 4 && (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Strong password
                      </span>
                    )}
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`appearance-none relative block w-full pl-10 px-4 py-3 border ${
                    validationErrors.confirmPassword
                      ? "border-red-500/50"
                      : "border-white/20"
                  } bg-white/10 backdrop-blur-sm placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="terms"
                className="font-medium text-gray-700 dark:text-gray-300"
              >
                I accept the{" "}
                <motion.button
                  type="button"
                  onClick={async () => {
                    try {
                      // Import the utility function to get terms content
                      const { getTermsContent } = await import(
                        "@/utils/termsUtils"
                      );

                      // Get the terms content
                      const content = await getTermsContent();
                      setTermsContent(content);
                    } catch (error) {
                      console.error("Error loading terms:", error);
                    }
                    setShowTerms(true);
                  }}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Terms of Service
                </motion.button>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <motion.button
              type="submit"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 text-white/80 animate-spin" />
                ) : (
                  <User className="h-5 w-5 text-white/80" />
                )}
              </span>
              <div className="flex items-center justify-center">
                {loading ? "Creating account..." : "Create account"}
              </div>
            </motion.button>
          </div>
        </motion.form>

        <motion.div variants={itemVariants} className="text-center mt-4">
          <Link
            href="/"
            className="flex items-center text-sm text-white/70 hover:text-white transition-colors group"
          >
            <div className="bg-white/10 p-1.5 rounded-full mr-2 group-hover:bg-white/20 transition-colors">
              <Home className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
            </div>
            Back to Home
          </Link>
          {/* Email Verification Modal */}
          {showVerificationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl border border-white/10 dark:border-gray-700/30"
              >
                <div className="text-center mb-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Account Created Successfully!
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    We've sent a verification code to{" "}
                    <span className="font-bold">{registeredEmail}</span>.
                    Please check your inbox and enter the verification code
                    below to activate your account.
                  </p>
                </div>

                <div className="mt-4 mb-6">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter Verification Code:
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={enteredVerificationCode}
                      onChange={(e) => {
                        setEnteredVerificationCode(e.target.value);
                        setVerificationError("");
                      }}
                      placeholder="Enter code from your email"
                      className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  {verificationError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {verificationError}
                    </p>
                  )}
                  {verificationSuccess && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Verification successful! Redirecting to login...
                    </p>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <motion.button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/auth/verify?token=${enteredVerificationCode}`
                        );
                        const data = await response.json();

                        if (data.success) {
                          setVerificationSuccess(true);
                          setVerificationError("");
                          setTimeout(() => {
                            router.push("/dashboard");
                          }, 2000);
                        } else {
                          setVerificationError(
                            data.error ||
                              "Invalid verification code. Please try again."
                          );
                        }
                      } catch (error) {
                        setVerificationError(
                          "An error occurred during verification. Please try again."
                        );
                      }
                    }}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200"
                    disabled={verificationSuccess}
                  >
                    Verify Account
                  </motion.button>
                  <motion.button
                    onClick={() => router.push("/auth/login")}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Go to Login
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
