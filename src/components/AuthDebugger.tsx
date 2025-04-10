"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";

export default function AuthDebugger() {
  const { user, isLoading, error } = useAuth();
  const [cookies, setCookies] = useState<string>("");
  const [showDebugger, setShowDebugger] = useState(false);

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
      
      <div className="mt-4">
        <button 
          onClick={() => {
            fetch("/api/auth/session-status", { credentials: "include" })
              .then(res => res.json())
              .then(data => console.log("Session status:", data))
              .catch(err => console.error("Session check error:", err));
          }}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Check Session
        </button>
      </div>
    </div>
  );
} 