"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import icons
const Bars3Icon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.Bars3Icon),
  { ssr: false }
);
const XMarkIcon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.XMarkIcon),
  { ssr: false }
);

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">TP</span>
            </motion.div>
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-xl font-bold text-white"
            >
              Tuning Portal
            </motion.span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center space-x-8"
            >
              <Link
                href="/features"
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Contact
              </Link>
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex items-center space-x-4"
            >
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </motion.div>
          </nav>

          {/* Mobile menu button */}
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-300"
          >
            <Bars3Icon className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0, y: -20 }}
        className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-end">
            <button className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-300">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="mt-8 space-y-6">
            <Link
              href="/features"
              className="block text-xl text-white hover:text-blue-400 transition-colors duration-300"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block text-xl text-white hover:text-blue-400 transition-colors duration-300"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="block text-xl text-white hover:text-blue-400 transition-colors duration-300"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-xl text-white hover:text-blue-400 transition-colors duration-300"
            >
              Contact
            </Link>
            <div className="pt-6 space-y-4">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 text-center rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-4 py-3 text-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </motion.div>
    </header>
  );
};
