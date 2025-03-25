"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Home, RefreshCw } from "lucide-react";

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

const buttonVariants = {
  hover: {
    scale: 1.03,
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  tap: { scale: 0.97 },
};

// Client component that uses useSearchParams
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const verifyEmail = async () => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    try {
      const response = await fetch(`/api/auth/verify?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(
          "Email verified successfully! You will be redirected to the dashboard."
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [router, searchParams, retryCount]);

  const handleRetry = () => {
    setStatus("verifying");
    setRetryCount((prev) => prev + 1);
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 relative z-10 bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm p-8 rounded-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/15 dark:hover:bg-gray-900/30"
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <motion.h2
            variants={itemVariants}
            className="mt-4 text-center text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
          >
            Email Verification
          </motion.h2>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 space-y-6">
          {status === "verifying" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 rounded-lg bg-white/5 border border-white/10"
            >
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
              <p className="mt-4 text-lg text-white/90">
                Verifying your email...
              </p>
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-lg bg-green-500/10 border border-green-500/20"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100/20 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Verification Successful!
                </h3>
                <p className="text-white/80">{message}</p>
              </div>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100/20 mb-4">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Verification Failed
                </h3>
                <p className="text-white/80 mb-4">{message}</p>
                <motion.button
                  onClick={handleRetry}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex items-center justify-center px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="text-center mt-6">
            <Link
              href="/"
              className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Back to home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-md w-full space-y-8 relative z-10 bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm p-8 rounded-xl border border-white/20 shadow-xl text-center">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg mb-4">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
            <p className="mt-4 text-lg text-white/90">
              Loading verification page...
            </p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
