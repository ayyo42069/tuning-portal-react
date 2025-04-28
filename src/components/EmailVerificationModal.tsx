"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useAuthDynamicIsland } from "@/contexts/AuthDynamicIslandContext";
import { useRouter } from "next/navigation";

interface EmailVerificationModalProps {
  email: string;
  onClose: () => void;
}

export default function EmailVerificationModal({ email, onClose }: EmailVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const { verifyEmail } = useAuth();
  const { state, setStatus, setMessage } = useAuthDynamicIsland();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("Verifying email...");

    try {
      await verifyEmail(verificationCode);
      setStatus("success");
      setMessage("Email verified successfully!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Verification failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Verify Your Email</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We've sent a verification code to {email}. Please enter it below to verify your email address.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter verification code"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={state.status === "loading"}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {state.status === "loading" ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>

        {state.message && (
          <p className={`mt-4 text-sm ${
            state.status === "error" ? "text-red-600 dark:text-red-400" : 
            state.status === "success" ? "text-green-600 dark:text-green-400" : 
            "text-gray-600 dark:text-gray-300"
          }`}>
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
} 