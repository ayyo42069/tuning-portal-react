"use client";

import Link from "next/link";

export const Header = () => {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 animate-gradient-x"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="container mx-auto py-6 px-4 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
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
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-md border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
