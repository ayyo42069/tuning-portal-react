"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from "next/navigation";

export default function DashboardDebug() {
  const { user, isLoading, error } = useAuth();
  const router = useRouter();
  const [showDebug, setShowDebug] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [sessionCheckTime, setSessionCheckTime] = useState<Date | null>(null);

  // Check session status
  const checkSession = async () => {
    try {
      console.log("[DashboardDebug] Checking session status...");
      const response = await fetch("/api/auth/session-status", {
        credentials: "include",
      });
      const data = await response.json();
      console.log("[DashboardDebug] Session status:", data);
      setSessionStatus(data);
      setSessionCheckTime(new Date());
    } catch (error) {
      console.error("[DashboardDebug] Session check error:", error);
    }
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Toggle debug panel with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!showDebug) return null;

  return (
    <div className="fixed top-0 right-0 bg-black/80 text-white p-4 rounded-bl-lg max-w-md max-h-96 overflow-auto z-50 text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Dashboard Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-white hover:text-red-400"
        >
          Close
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>Loading:</div>
        <div>{isLoading ? "Yes" : "No"}</div>
        
        <div>User:</div>
        <div>{user ? "Logged in" : "Not logged in"}</div>
        
        <div>User ID:</div>
        <div>{user?.id || "N/A"}</div>
        
        <div>Username:</div>
        <div>{user?.username || "N/A"}</div>
        
        <div>Role:</div>
        <div>{user?.role || "N/A"}</div>
        
        <div>Error:</div>
        <div className="text-red-400">{error || "None"}</div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-bold mb-1">Session Status:</h4>
        <div className="bg-gray-800 p-2 rounded overflow-x-auto">
          <pre>{JSON.stringify(sessionStatus, null, 2)}</pre>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Last checked: {sessionCheckTime?.toLocaleTimeString() || "Never"}
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={checkSession}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Check Session
        </button>
        
        <button 
          onClick={() => {
            console.log("[DashboardDebug] Manually refreshing user data...");
            fetch("/api/auth/me", { credentials: "include" })
              .then(res => res.json())
              .then(data => console.log("[DashboardDebug] User data:", data))
              .catch(err => console.error("[DashboardDebug] User data error:", err));
          }}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          Refresh User
        </button>
        
        <button 
          onClick={() => {
            console.log("[DashboardDebug] Manually refreshing token...");
            fetch("/api/auth/refresh-token", { 
              method: "POST",
              credentials: "include" 
            })
              .then(res => res.json())
              .then(data => console.log("[DashboardDebug] Token refresh:", data))
              .catch(err => console.error("[DashboardDebug] Token refresh error:", err));
          }}
          className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs"
        >
          Refresh Token
        </button>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => {
            console.log("[DashboardDebug] Manually logging out...");
            fetch("/api/auth/logout", { 
              method: "POST",
              credentials: "include" 
            })
              .then(() => {
                console.log("[DashboardDebug] Logout successful");
                router.push("/auth/login");
              })
              .catch(err => console.error("[DashboardDebug] Logout error:", err));
          }}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          Force Logout
        </button>
      </div>
    </div>
  );
} 