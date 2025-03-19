"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on component mount and handle localStorage persistence
  useEffect(() => {
    // Check if we have auth data in localStorage first
    const storedAuthData = localStorage.getItem("auth_state");
    if (storedAuthData) {
      try {
        // Parse stored auth data
        const parsedAuthData = JSON.parse(storedAuthData);
        // Set user from localStorage first for immediate UI update
        setUser(parsedAuthData);
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        // Clear invalid data
        localStorage.removeItem("auth_state");
      }
    }

    // Always refresh user data from server to ensure it's up-to-date
    refreshUser();

    // Set up a more frequent refresh to detect session termination quickly
    const refreshInterval = setInterval(() => {
      refreshUser();
    }, 30 * 1000); // Refresh every 30 seconds to detect termination faster

    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Handle F5 refresh and tab/browser close events
  useEffect(() => {
    // Add event listener for beforeunload to ensure auth state is saved
    const handleBeforeUnload = () => {
      // Ensure the latest auth state is persisted
      if (user) {
        localStorage.setItem("auth_state", JSON.stringify(user));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  const refreshUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok && data.user) {
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

        // Handle banned user
        if (userData.isBanned) {
          setError(
            `Your account has been banned. Reason: ${userData.banReason}`
          );
          // Redirect to banned user page
          window.location.href = "/auth/banned";
          return;
        }
      } else {
        // User is not logged in or session expired
        setUser(null);
        // Clear localStorage
        localStorage.removeItem("auth_state");

        // Check for session termination specifically
        if (
          data.error === "Session terminated" ||
          data.redirectTo === "/auth/terminated"
        ) {
          // Redirect to terminated page immediately
          window.location.href = "/auth/terminated";
          return;
        }
        // Handle other session termination and authentication errors
        else if (data.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        } else if (window.location.pathname.startsWith("/dashboard")) {
          // Redirect to login if unauthorized access to dashboard
          window.location.href = "/auth/login";
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      setError("Failed to authenticate user");
      setUser(null);
      // Clear localStorage on error
      localStorage.removeItem("auth_state");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
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

      if (response.ok) {
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
          window.location.href = "/auth/banned";
          return false;
        }

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
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear user state
        setUser(null);
        // Clear localStorage
        localStorage.removeItem("auth_state");
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
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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
