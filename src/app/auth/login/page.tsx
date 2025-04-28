"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { useFeedback } from "@/lib/FeedbackProvider";
import { useAuthDynamicIsland } from "@/contexts/AuthDynamicIslandContext";
import DynamicIsland from "@/components/DynamicIsland";
import Link from "next/link";

interface FormData {
  email: string;
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showFeedback } = useFeedback();
  const { state, setStatus, setProgress, setMessage, setValidationErrors, reset } = useAuthDynamicIsland();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    // Reset Dynamic Island state when component mounts
    reset();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.email && !formData.username) {
      errors.identifier = "Email or username is required";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setProgress(0);

    if (!validateForm()) {
      setStatus("error");
      setMessage("Please fix the validation errors");
      return;
    }

    try {
      setProgress(30);
      setMessage("Authenticating...");
      
      const loginIdentifier = formData.email || formData.username;
      await login(loginIdentifier, formData.password);
      
      setProgress(100);
      setStatus("success");
      setMessage("Login successful!");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Login failed");
      showFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Login failed"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <DynamicIsland
        variant="auth"
        status={state.status}
        progress={state.progress}
        message={state.message}
      />
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email or Username
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  state.validationErrors.identifier
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700`}
                placeholder="Enter your email or username"
                value={formData.email || formData.username}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes("@")) {
                    setFormData({ ...formData, email: value, username: "" });
                  } else {
                    setFormData({ ...formData, username: value, email: "" });
                  }
                }}
              />
              {state.validationErrors.identifier && (
                <p className="mt-1 text-sm text-red-500">{state.validationErrors.identifier}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  state.validationErrors.password
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {state.validationErrors.password && (
                <p className="mt-1 text-sm text-red-500">{state.validationErrors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={state.status === "loading"}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.status === "loading" ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
