"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export const Header = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 dark:from-blue-700 dark:via-indigo-800 dark:to-purple-900 animate-gradient-x"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="container mx-auto py-6 px-4 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Tuning Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-md border-2 border-white dark:border-gray-600 text-white hover:bg-white hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-white text-sm">
          <div className="flex justify-center space-x-6">
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
