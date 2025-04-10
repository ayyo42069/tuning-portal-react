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
      // First check session status
      const sessionResponse = await fetch("/api/auth/session-status", {
        credentials: "include",
      });
      const sessionData = await sessionResponse.json();

      if (!sessionData.success) {
        // Only redirect if we're not already on an auth page and there's no stored auth state
        const storedAuth = localStorage.getItem("auth_state");
        if (!pathname.startsWith("/auth/") && !storedAuth) {
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
        console.error("Token refresh failed");
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
        if (!pathname.startsWith("/auth/")) {
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
        await checkSession();
      } catch (error) {
        console.error("Initial session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [checkSession]);

  // Set up periodic session checks (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(checkSession, 5 * 60 * 1000);
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
          router.push("/auth/banned");
          return false;
        }

        // Immediately trigger data fetching for notifications and other user data using React Query
        // This ensures the dashboard shows the latest data without requiring a manual refresh
        try {
          // Get access to the QueryClient instance
          const queryClientModule = await import("./QueryProvider");
          const queryClient = queryClientModule.getQueryClient();

          if (queryClient) {
            // Import query keys from useDataFetching
            const { queryKeys } = await import("./hooks/useDataFetching");

            // Invalidate all relevant queries to trigger immediate refetching
            queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
            queryClient.invalidateQueries({
              queryKey: [queryKeys.notifications],
            });
            queryClient.invalidateQueries({ queryKey: [queryKeys.credits] });
            queryClient.invalidateQueries({
              queryKey: [queryKeys.tuningFiles],
            });

            // Prefetch critical data to ensure it's immediately available
            queryClient.prefetchQuery({
              queryKey: [queryKeys.user, userData.id],
              queryFn: async () => {
                const response = await fetch("/api/user/profile", {
                  credentials: "include",
                });
                if (!response.ok)
                  throw new Error("Failed to fetch user profile");
                return response.json();
              },
            });

            // Also prefetch notifications
            queryClient.prefetchQuery({
              queryKey: [queryKeys.notifications, userData.id],
              queryFn: async () => {
                const response = await fetch("/api/notifications", {
                  credentials: "include",
                });
                if (!response.ok)
                  throw new Error("Failed to fetch notifications");
                const data = await response.json();
                return data.notifications;
              },
            });

            // Prefetch credit transactions and update user state with latest credit balance
            queryClient.prefetchQuery({
              queryKey: [queryKeys.credits, userData.id],
              queryFn: async () => {
                // First get the latest credit balance
                const balanceResponse = await fetch("/api/credits/balance", {
                  credentials: "include",
                });
                if (balanceResponse.ok) {
                  const balanceData = await balanceResponse.json();
                  // Update user state with the latest credit balance
                  const updatedUserData = {
                    ...userData,
                    credits: balanceData.credits,
                  };
                  setUser(updatedUserData);
                  // Update localStorage with the latest credit information
                  localStorage.setItem(
                    "auth_state",
                    JSON.stringify(updatedUserData)
                  );
                }

                // Then fetch transactions as before
                const response = await fetch("/api/credits/transactions", {
                  credentials: "include",
                });
                if (!response.ok)
                  throw new Error("Failed to fetch credit transactions");
                return response.json();
              },
            });

            // Prefetch tuning files if needed
            queryClient.prefetchQuery({
              queryKey: [queryKeys.tuningFiles, userData.id],
              queryFn: async () => {
                const response = await fetch("/api/tuning/history", {
                  credentials: "include",
                });
                if (!response.ok)
                  throw new Error("Failed to fetch tuning files");
                const data = await response.json();
                return data.tuningFiles;
              },
            });
          } else {
            // Fallback to direct fetch calls if queryClient is not available
            const notificationsModule = await import("./NotificationProvider");
            if (
              notificationsModule &&
              typeof notificationsModule.fetchNotificationsGlobal === "function"
            ) {
              notificationsModule.fetchNotificationsGlobal();
            } else {
              // Fallback: try to fetch notifications directly
              fetch("/api/notifications", { credentials: "include" });
            }

            // Fetch user profile data to ensure credits and other info are up-to-date
            fetch("/api/user/profile", { credentials: "include" })
              .then((response) => {
                if (response.ok) return response.json();
                throw new Error("Failed to fetch user profile");
              })
              .then((data) => {
                if (data.user) {
                  // Update user state with the latest user data
                  const updatedUserData = {
                    ...userData,
                    credits: data.user.credits || 0,
                  };
                  setUser(updatedUserData);
                  localStorage.setItem(
                    "auth_state",
                    JSON.stringify(updatedUserData)
                  );
                }
              })
              .catch((error) =>
                console.error("Error updating user data:", error)
              );

            // Fetch credit balance directly and update user state
            fetch("/api/credits/balance", { credentials: "include" })
              .then((response) => {
                if (response.ok) return response.json();
                throw new Error("Failed to fetch credit balance");
              })
              .then((data) => {
                // Update user state with the latest credit balance
                const updatedUserData = {
                  ...userData,
                  credits: data.credits,
                };
                setUser(updatedUserData);
                localStorage.setItem(
                  "auth_state",
                  JSON.stringify(updatedUserData)
                );
              })
              .catch((error) =>
                console.error("Error updating credit balance:", error)
              );

            // Fetch credit transactions if needed
            fetch("/api/credits/transactions", { credentials: "include" });

            // Fetch tuning files history
            fetch("/api/tuning/history", { credentials: "include" });
          }
        } catch (fetchError) {
          // Log but don't fail the login process if these fetches fail
          console.error("Error pre-fetching user data:", fetchError);
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
