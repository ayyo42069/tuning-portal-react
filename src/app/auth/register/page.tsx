"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [enteredVerificationCode, setEnteredVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Terms of Service
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <h4>1. Acceptance of Terms</h4>
              <p>
                By registering for an account, you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do
                not register or use our services.
              </p>

              <h4>2. User Accounts</h4>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized
                use of your account.
              </p>

              <h4>3. Prohibited Activities</h4>
              <p>
                You agree not to create multiple accounts for the purpose of
                abusing our services, engaging in fraudulent activities, or
                circumventing any limitations. We reserve the right to suspend
                or terminate accounts that violate these terms.
              </p>

              <h4>4. Data Collection</h4>
              <p>
                We collect certain information about your device for security
                purposes and to prevent fraud. This may include your IP address,
                browser information, and device characteristics. This
                information is processed in accordance with our Privacy Policy.
              </p>

              <h4>5. Privacy</h4>
              <p>
                We respect your privacy and protect your personal information.
                Please review our Privacy Policy to understand how we collect,
                use, and disclose information about you.
              </p>

              <h4>6. Termination</h4>
              <p>
                We reserve the right to terminate or suspend your account at any
                time for violations of these terms or for any other reason at
                our discretion.
              </p>

              <h4>7. Changes to Terms</h4>
              <p>
                We may modify these terms at any time. Continued use of our
                services after such changes constitutes your acceptance of the
                new terms.
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${
                    validationErrors.username
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:text-white`}
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
                  className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${
                    validationErrors.email
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:text-white`}
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
                  className="appearance-none relative block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:text-white"
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
                  className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:text-white`}
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
                  className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${
                    validationErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:text-white`}
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
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Terms of Service
                </button>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </div>
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
          >
            <Home className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          {/* Email Verification Modal */}
          {showVerificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="text-center mb-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Account Created Successfully!
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    We've sent a verification code to{" "}
                    <span className="font-bold">{registeredEmail}</span>. Please
                    check your inbox and enter the verification code below to
                    activate your account.
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
                  <button
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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={verificationSuccess}
                  >
                    Verify Account
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
