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
  const checkSession = useCallback(async () => {
    try {
      // Define protected routes that require authentication
      const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings'];
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

      // First check session status
      const sessionResponse = await fetch("/api/auth/session-status", {
        credentials: "include",
      });
      
      if (!sessionResponse.ok) {
        console.error("Session check failed:", sessionResponse.status);
        // Only redirect if we're on a protected route
        if (isProtectedRoute && !pathname.startsWith("/auth/")) {
          router.push("/auth/login");
        }
        setUser(null);
        return;
      }

      const sessionData = await sessionResponse.json();

      if (!sessionData.success) {
        // Only redirect if we're on a protected route
        if (isProtectedRoute && !pathname.startsWith("/auth/")) {
          router.push("/auth/login");
        }
        setUser(null);
        return;
      }

      // Then refresh the token
      const tokenResponse = await fetch("/api/auth/refresh-token", {
        method: "POST",
        credentials: "include",
      });
      
      if (!tokenResponse.ok) {
        console.error("Token refresh failed:", tokenResponse.status);
      }

      // Finally refresh user data
      await refreshUser();
    } catch (error) {
      console.error("Session check failed:", error);
      // Don't immediately log out on network errors
      if (!pathname.startsWith("/auth/")) {
        setError("Failed to verify session. Please try again.");
      }
    }
  }, [pathname, router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setError(null);
        // Update stored auth state
        localStorage.setItem("auth_state", JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem("auth_state");
        // Only redirect if we're on a protected route
        const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
        if (isProtectedRoute && !pathname.startsWith("/auth/")) {
          router.push("/auth/login");
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Don't immediately log out on network errors
      if (!pathname.startsWith("/auth/")) {
        setError("Failed to refresh user data. Please try again.");
      }
    }
  }, [pathname, router]);

  // Initial session check
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Add a small delay before the initial check to allow cookies to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkSession();
      } catch (error) {
        console.error("Initial session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [checkSession]);

  // Set up periodic session checks (every 15 minutes instead of 5)
  useEffect(() => {
    const interval = setInterval(checkSession, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSession]);

  // Refresh user data periodically (every 15 minutes)
  useEffect(() => {
    const interval = setInterval(refreshUser, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshUser]);

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

      const data = await response.json();

      if (response.ok && data.success) {
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
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirect to dashboard on successful login
        router.push("/dashboard");
        return true;
      } else {
        setError(data.error || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
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
        refreshUser,
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
