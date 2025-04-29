"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthProvider";
import NotificationBell from "@/components/NotificationBell";
import { CreditCard, LogOut } from "lucide-react";

interface HeaderProps {
  variant?: 'landing' | 'dashboard' | 'admin';
}

export const Header = ({ variant = 'landing' }: HeaderProps) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-950"></div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/circuit-board.svg')",
            backgroundSize: "300px",
          }}
        ></div>
      </div>

      {/* Hexagon pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "30px",
            filter: "blur(0.5px)",
          }}
        ></div>
      </div>

      {/* Animated glow effects */}
      <motion.div
        className="absolute -left-32 top-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 10, 0],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -right-32 top-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -10, 0],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="container mx-auto py-6 px-4 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-semibold text-white">Tuning Portal</span>
          </div>

          <div className="flex items-center space-x-4">
            {variant !== 'landing' && user && (
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 px-3 py-1.5 rounded-lg flex items-center hover:bg-white/15 dark:hover:bg-gray-700/30 transition-all duration-300">
                <CreditCard className="h-4 w-4 text-blue-200 mr-1.5" />
                <span className="text-sm font-medium text-blue-200">
                  {user.credits || 0} Credits
                </span>
              </div>
            )}
            
            {variant !== 'landing' && <NotificationBell />}
            <ThemeToggle />
            
            {user ? (
              <>
                {variant === 'landing' && (
                  <span className="text-white hidden md:inline">
                    Welcome, {user.username}
                  </span>
                )}
                <Link
                  href={variant === 'admin' ? '/admin' : '/dashboard'}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 font-medium"
                >
                  {variant === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-300 font-medium backdrop-blur-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-300 font-medium backdrop-blur-sm"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 