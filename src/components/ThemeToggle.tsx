"use client";

import { useTheme } from "@/lib/ThemeProvider";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-300 ease-in-out bg-gray-200 dark:bg-gray-700"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <motion.div
        className="absolute left-1 w-4 h-4 rounded-full bg-white dark:bg-gray-300 flex items-center justify-center"
        animate={{
          x: theme === "light" ? 0 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      >
        {theme === "light" ? (
          <Sun className="w-3 h-3 text-yellow-500" />
        ) : (
          <Moon className="w-3 h-3 text-gray-700" />
        )}
      </motion.div>
    </button>
  );
}
