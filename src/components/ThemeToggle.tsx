"use client";

import { useTheme } from "@/lib/ThemeProvider";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out bg-gray-300 dark:bg-gray-700"
      aria-label="Toggle theme"
    >
      <motion.span
        className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out"
        animate={{
          x: theme === "dark" ? 5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      />
    </button>
  );
}
