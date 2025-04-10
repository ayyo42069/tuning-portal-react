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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
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

  // Check session status and refresh user data
  const checkSession = async () => {
    try {
      console.log("[AuthProvider] Checking session status");
      const response = await fetch("/api/auth/session-status", {
        credentials: "include",
      });

      console.log(`[AuthProvider] Session status response: ${response.status}`);
      const data = await response.json();
      console.log("[AuthProvider] Session status data:", data);

      if (!data.success) {
        console.log("[AuthProvider] Session check failed, logging out");
        await logout();
        return;
      }

      if (data.user) {
        console.log("[AuthProvider] User data received:", data.user);
        setUser(data.user);
        setLoading(false);
        setError(null);
      } else {
        console.log("[AuthProvider] No user data in response, but session is valid");
        // If we have a valid session but no user data, try to refresh user data
        await refreshUserData();
      }
    } catch (error) {
      console.error("[AuthProvider] Error checking session:", error);
      await logout();
    }
  };

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
        console.log("[AuthProvider] Failed to refresh user data, checking session");
        // If user data refresh fails, check session status
        await checkSession();
      }
    } catch (error) {
      console.error("[AuthProvider] Error refreshing user data:", error);
      // If there's an error refreshing user data, check session status
      await checkSession();
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      console.log("[AuthProvider] Refreshing token");
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      console.log(`[AuthProvider] Token refresh response: ${response.status}`);
      const data = await response.json();
      console.log("[AuthProvider] Token refresh data:", data);

      if (!data.success) {
        console.log("[AuthProvider] Token refresh failed, checking session");
        // If token refresh fails, check session status
        await checkSession();
      } else {
        console.log("[AuthProvider] Token refreshed successfully");
      }
    } catch (error) {
      console.error("[AuthProvider] Error refreshing token:", error);
      // If there's an error refreshing token, check session status
      await checkSession();
    }
  };

  // Initial session check
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
        
        // Add a small delay before the initial check to allow cookies to be set
        console.log("[Auth] Waiting for cookies to be set...");
        await new Promise(resolve => setTimeout(resolve, 500));
        await checkSession();
      } catch (error) {
        console.error("[Auth] Initial session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [checkSession, pathname]);

  // Set up periodic session checks (every 15 minutes instead of 5)
  useEffect(() => {
    const interval = setInterval(checkSession, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSession]);

  // Refresh user data periodically (every 15 minutes)
  useEffect(() => {
    const interval = setInterval(refreshUserData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshUserData]);

  // Handle session termination
  const handleSessionTermination = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      console.log("[Auth] Attempting login...");
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      console.log(`[Auth] Login response: ${response.status}`);
      const data = await response.json();
      console.log("[Auth] Login data:", data);

      if (response.ok && data.success) {
        console.log("[Auth] Login successful");
        // Create user object with all necessary properties
        const userData = {
          ...data.user,
          credits: data.user.credits !== undefined ? data.user.credits : 0,
          isBanned: data.user.isBanned || false,
          banReason: data.user.banReason || null,
          banExpiresAt: data.user.banExpiresAt || null,
        };

        // Set user in state
        setUser(userData);

        // Store in localStorage for persistence across page refreshes
        localStorage.setItem("auth_state", JSON.stringify(userData));

        // Check if user is banned
        if (userData.isBanned) {
          console.log("[Auth] User is banned");
          setError(
            `Your account has been banned. Reason: ${userData.banReason}`
          );
          // Still store the user data so the banned page can display ban details
          localStorage.setItem("auth_state", JSON.stringify(userData));

          // Redirect to banned page
          router.push("/auth/banned");
          return false;
        }

        // Wait a moment for cookies to be set
        console.log("[Auth] Waiting for cookies to be set...");
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirect to dashboard on successful login
        console.log("[Auth] Redirecting to dashboard");
        router.push("/dashboard");
        return true;
      } else {
        console.log("[Auth] Login failed:", data.error);
        setError(data.error || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("[Auth] Login error:", error);
      setError("An error occurred during login");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear user state
        setUser(null);
        // Clear localStorage
        localStorage.removeItem("auth_state");
        // Clear auth_session and auth_token, session_id cookies to prevent redirect loop
        document.cookie =
          "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } else {
        const data = await response.json();
        setError(data.error || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setError("An error occurred during logout");
      // Still clear localStorage and state on error to prevent being stuck in a logged-in state
      setUser(null);
      localStorage.removeItem("auth_state");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loading,
        error,
        login,
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

// Add a hook to check for session termination in dashboard components
export function useSessionTerminationCheck() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Check session status immediately when component mounts
    refreshUser();

    // Set up a frequent check for session termination
    const checkInterval = setInterval(() => {
      refreshUser();
    }, 15 * 1000); // Check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [refreshUser]);
}
