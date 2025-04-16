"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from "next/navigation";

export default function AuthDebugger() {
  const { user, isLoading, error } = useAuth();
  const [cookies, setCookies] = useState<string>("");
  const [showDebugger, setShowDebugger] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie);
  }, []);

  // Toggle debugger visibility with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setShowDebugger(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        router.push("/auth/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Network error during logout");
    }
  };

  if (!showDebugger) return null;

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-4 rounded-tl-lg max-w-md max-h-96 overflow-auto z-50 text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debugger</h3>
        <button 
          onClick={() => setShowDebugger(false)}
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
        <h4 className="font-bold mb-1">Cookies:</h4>
        <div className="bg-gray-800 p-2 rounded overflow-x-auto">
          {cookies || "No cookies found"}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-bold mb-1">Local Storage:</h4>
        <div className="bg-gray-800 p-2 rounded overflow-x-auto">
          {localStorage.getItem("auth_state") || "No auth state in localStorage"}
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={() => {
            console.log("[AuthDebugger] Manually refreshing user data...");
            fetch("/api/auth/user", { credentials: "include" })
              .then(res => res.json())
              .then(data => console.log("[AuthDebugger] User data:", data))
              .catch(err => console.error("[AuthDebugger] User data error:", err));
          }}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          Refresh User
        </button>
        
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          Force Logout
        </button>
      </div>
    </div>
  );
} 