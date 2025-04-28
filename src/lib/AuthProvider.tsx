"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
// Define User interface with credits and ban status
interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  credits?: number;
  isBanned?: boolean;
  banReason?: string;
  banExpiresAt?: string;
  email_verified?: boolean;
  last_login_date?: string;
  registration_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Refresh user data
  const refreshUserData = async () => {
    try {
      console.log("[AuthProvider] Refreshing user data");
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });

      console.log(`[AuthProvider] User data response: ${response.status}`);
      const data = await response.json();
      console.log("[AuthProvider] User data:", data);

      if (data.success && data.user) {
        console.log("[AuthProvider] Setting new user data");
        setUser(data.user);
        setLoading(false);
        setError(null);
        // Update stored auth state
        localStorage.setItem("auth_state", JSON.stringify(data.user));
      } else {
        console.log("[AuthProvider] Failed to refresh user data");
        setError("Failed to refresh user data");
        setLoading(false);
      }
    } catch (error) {
      console.error("[AuthProvider] Error refreshing user data:", error);
      setError("Failed to refresh user data. Please try again.");
      setLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[Auth] Initializing auth...");
        // Check if we're on an auth route to avoid redirect loops
        if (pathname.startsWith("/auth/")) {
          console.log("[Auth] On auth route, skipping initialization");
          setLoading(false);
          return;
        }
        
        // Try to get user data from localStorage first
        const storedAuthState = localStorage.getItem("auth_state");
        if (storedAuthState) {
          try {
            const parsedUser = JSON.parse(storedAuthState);
            console.log("[Auth] Found stored user data");
            setUser(parsedUser);
          } catch (e) {
            console.error("[Auth] Error parsing stored auth state:", e);
            localStorage.removeItem("auth_state");
          }
        }
        
        // Refresh user data from server
        await refreshUserData();
      } catch (error) {
        console.error("[Auth] Initial auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [pathname]);

  // Refresh user data periodically (every 15 minutes)
  useEffect(() => {
    const interval = setInterval(refreshUserData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log("[Auth] Attempting login...");
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: username, password }),
        credentials: "include",
      });

      console.log(`[Auth] Login response: ${response.status}`);
      const data = await response.json();
      console.log("[Auth] Login data:", data);

      if (data.success) {
        console.log("[Auth] Login successful");
        // Update user state with the returned user data
        setUser(data.user);
        setLoading(false);
        setError(null);
        
        // Store auth state in localStorage
        localStorage.setItem("auth_state", JSON.stringify(data.user));
        
        // Redirect to dashboard
        console.log("[Auth] Redirecting to dashboard");
        router.push("/dashboard");
        
        return true;
      } else {
        console.log("[Auth] Login failed:", data.error);
        setError(data.error || "Login failed");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("[Auth] Login error:", error);
      setError("An error occurred during login");
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("[Auth] Logging out...");
      setLoading(true);
      
      // Call logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      console.log(`[Auth] Logout response: ${response.status}`);
      
      // Clear user state
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem("auth_state");
      
      // Clear cookies
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Redirect to login page
      console.log("[Auth] Redirecting to login page");
      router.push("/auth/login");
      
      setLoading(false);
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      setError("An error occurred during logout");
      setLoading(false);
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    try {
      console.log("[Auth] Attempting registration...");
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      console.log(`[Auth] Register response: ${response.status}`);
      const result = await response.json();
      console.log("[Auth] Register result:", result);

      if (result.success) {
        console.log("[Auth] Registration successful");
        setLoading(false);
        setError(null);
        return true;
      } else {
        console.log("[Auth] Registration failed:", result.error);
        setError(result.error || "Registration failed");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("[Auth] Registration error:", error);
      setError("An error occurred during registration");
      setLoading(false);
      return false;
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      console.log("[Auth] Verifying email...");
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      console.log(`[Auth] Verify email response: ${response.status}`);
      const result = await response.json();
      console.log("[Auth] Verify email result:", result);

      if (result.success) {
        console.log("[Auth] Email verification successful");
        setLoading(false);
        setError(null);
        return true;
      } else {
        console.log("[Auth] Email verification failed:", result.error);
        setError(result.error || "Email verification failed");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("[Auth] Email verification error:", error);
      setError("An error occurred during email verification");
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loading,
        error,
        login,
        register,
        verifyEmail,
        logout,
        refreshUser: refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
