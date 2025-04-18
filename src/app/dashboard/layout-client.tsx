'use client';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  History,
  CreditCard,
  Bell,
  Upload,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import OpeningHours from "@/components/OpeningHours";
import { useAuth } from "@/lib/AuthProvider";
import FloatingTicketButton from "@/components/FloatingTicketButton";
import DashboardDebug from "./components/DashboardDebug";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("[DashboardLayout] No user found, redirecting to login");
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    
    if (sidebarRef.current) {
      if (sidebarOpen) {
        sidebarRef.current.classList.add("sidebar-hidden");
        sidebarRef.current.classList.remove("sidebar-visible");
      } else {
        sidebarRef.current.classList.remove("sidebar-hidden");
        sidebarRef.current.classList.add("sidebar-visible");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Debug component */}
      <DashboardDebug />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 relative overflow-hidden">
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

        {/* Header */}
        <header className="relative z-10 bg-transparent flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border border-white/20 dark:border-gray-700/30 backdrop-blur-md">
          {/* Left side - Logo and Tuning Portal text */}
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="Logo" className="h-12 w-12" />
            <span className="text-xl font-semibold text-purple-400">Tuning Portal</span>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 px-3 py-1.5 rounded-lg flex items-center hover:bg-white/15 dark:hover:bg-gray-700/30 transition-all duration-300">
              <CreditCard className="h-4 w-4 text-blue-200 mr-1.5" />
              <span className="text-sm font-medium text-blue-200">
                {user?.credits || 0} Credits
              </span>
            </div>
            <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2 rounded-lg hover:bg-white/15 dark:hover:bg-gray-700/30 transition-all duration-300">
              <NotificationBell />
            </div>
            <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2 rounded-lg hover:bg-white/15 dark:hover:bg-gray-700/30 transition-all duration-300">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 p-2 rounded-lg hover:bg-white/15 dark:hover:bg-gray-700/30 transition-all duration-300"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-blue-200" />
            </button>
          </div>
        </header>

        {/* Animated elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            initial={{ x: -100, opacity: 0.2 }}
            animate={{ x: 0, opacity: 0.15 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 -top-64 -left-64 will-change-transform"
          />
          <motion.div
            initial={{ x: 100, opacity: 0.2 }}
            animate={{ x: 0, opacity: 0.15 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 top-1/3 -right-64 will-change-transform"
          />
          <motion.div
            initial={{ y: 100, opacity: 0.2 }}
            animate={{ y: 0, opacity: 0.15 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
            className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 -bottom-32 left-1/3 will-change-transform"
          />
        </div>

        <div className="relative z-10 flex">
          {/* Mobile menu button */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div
            ref={sidebarRef}
            id="sidebar"
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 fixed md:static z-40 w-72 min-h-screen bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-lg transition-transform duration-300 ease-in-out`}
          >
            <div className="flex flex-col h-full">
              {/* User info */}
              <div className="p-6 border-b border-white/10 dark:border-gray-700/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-white font-medium">Hello, {user?.username || "User"}</h3>
                    <p className={`text-sm ${user?.role === "admin" ? "text-red-500" : "text-green-500"} bg-white/10 dark:bg-gray-800/20 backdrop-blur-md px-2 py-1 rounded-lg`}>{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 p-4">
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 dark:hover:bg-blue-900/30 hover:text-cyan-300 dark:hover:text-blue-400 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3 text-blue-300 group-hover:text-cyan-300 transition-colors" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/tuning-history"
                  className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 dark:hover:bg-blue-900/30 hover:text-cyan-300 dark:hover:text-blue-400 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <History className="h-5 w-5 mr-3 text-blue-300 group-hover:text-cyan-300 transition-colors" />
                  Tuning History
                </Link>
                <Link
                  href="/dashboard/credits"
                  className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 dark:hover:bg-blue-900/30 hover:text-cyan-300 dark:hover:text-blue-400 transition-all duration-200 group backdrop-blur-sm"
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <CreditCard className="h-5 w-5 mr-3 text-blue-300 group-hover:text-cyan-300 transition-colors" />
                  Credits
                </Link>
                {user?.role === "admin" && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 dark:hover:bg-blue-900/30 hover:text-cyan-300 dark:hover:text-blue-400 transition-all duration-200 group backdrop-blur-sm"
                      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-3 text-blue-300 group-hover:text-cyan-300 transition-colors" />
                      Admin Panel
                    </Link>
                    {/* Opening Hours moved under admin panel */}
                    <div className="px-4 py-3">
                      <OpeningHours />
                    </div>
                  </>
                )}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 md:p-8 overflow-auto">
            {children}
          </div>
        </div>
      </div>
      
      {/* Floating ticket button */}
      <FloatingTicketButton />
    </div>
  );
} 