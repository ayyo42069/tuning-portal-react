"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { useFeedback } from "@/lib/FeedbackProvider";
import { useAuthDynamicIsland } from "@/contexts/AuthDynamicIslandContext";
import DynamicIsland from "@/components/DynamicIsland";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import { User, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Check } from "lucide-react";

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password: string) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showFeedback } = useFeedback();
  const { state, setStatus, setProgress, setMessage, setValidationErrors, reset } = useAuthDynamicIsland();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    acceptTerms: false,
    fullName: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [validationState, setValidationState] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
    acceptTerms: false
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    reset();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update validation state
    if (name === 'username') {
      setValidationState(prev => ({
        ...prev,
        username: value.length >= 3
      }));
    } else if (name === 'email') {
      setValidationState(prev => ({
        ...prev,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      }));
    } else if (name === 'password') {
      setValidationState(prev => ({
        ...prev,
        password: value.length >= 8,
        confirmPassword: value === formData.confirmPassword
      }));
    } else if (name === 'confirmPassword') {
      setValidationState(prev => ({
        ...prev,
        confirmPassword: value === formData.password
      }));
    } else if (name === 'firstName') {
      setValidationState(prev => ({
        ...prev,
        firstName: value.length >= 2
      }));
    } else if (name === 'lastName') {
      setValidationState(prev => ({
        ...prev,
        lastName: value.length >= 2
      }));
    } else if (name === 'acceptTerms') {
      setValidationState(prev => ({
        ...prev,
        acceptTerms: checked
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("loading");
    setProgress(0);

    if (!validateForm()) {
      setStatus("error");
      setMessage("Please fix the validation errors");
      return;
    }

    try {
      setProgress(30);
      setMessage("Creating your account...");
      
      const success = await register(formData);
      
      if (success) {
        setProgress(100);
        setStatus("success");
        setMessage("Account created successfully! Please verify your email.");
        setShowVerificationModal(true);
      } else {
        setStatus("error");
        setMessage("Registration failed. Please try again.");
        showFeedback({
          type: "error",
          message: "Registration failed. Please try again."
        });
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Registration failed");
      showFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Registration failed"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = () => {
    const totalFields = Object.keys(validationState).length;
    const validFields = Object.values(validationState).filter(Boolean).length;
    return (validFields / totalFields) * 100;
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.username) {
      errors.push("Username is required");
    } else if (formData.username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }
    if (!formData.email) {
      errors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("Email is invalid");
    }
    if (!formData.password) {
      errors.push("Password is required");
    } else if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!formData.fullName) {
      errors.push("Full name is required");
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <DynamicIsland
        variant="auth"
        status={state.status}
        progress={state.progress}
        message={state.message}
        onExpand={() => setIsExpanded(!isExpanded)}
        isExpanded={isExpanded}
      />

      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        className="w-full max-w-md bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl p-8 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join our community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                  ${validationState.username ? 'border-green-500 focus:ring-green-500' : 'border-gray-600 focus:ring-blue-500'}`}
                required
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                  ${validationState.email ? 'border-green-500 focus:ring-green-500' : 'border-gray-600 focus:ring-blue-500'}`}
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                  ${validationState.password ? 'border-green-500 focus:ring-green-500' : 'border-gray-600 focus:ring-blue-500'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                  ${validationState.confirmPassword ? 'border-green-500 focus:ring-green-500' : 'border-gray-600 focus:ring-blue-500'}`}
                required
              />
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                  ${validationState.firstName ? 'border-green-500 focus:ring-green-500' : 'border-gray-600 focus:ring-blue-500'}`}
                required
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="relative">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                  ${validationState.lastName ? 'border-green-500 focus:ring-green-500' : 'border-gray-600 focus:ring-blue-500'}`}
                required
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700/50 text-blue-500 focus:ring-blue-500"
              required
            />
            <label className="ml-2 text-sm text-gray-400">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-500 hover:text-blue-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-500 hover:text-blue-400">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !Object.values(validationState).every(Boolean)}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all
              ${isLoading || !Object.values(validationState).every(Boolean)
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      {showVerificationModal && (
        <EmailVerificationModal
          email={formData.email}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
}
