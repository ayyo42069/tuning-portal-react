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

    // Check specifically for session termination
    checkSessionTermination();

    // Set up intervals for regular checks
    const refreshInterval = setInterval(() => {
      refreshUser();
    }, 60 * 1000); // Refresh user data every minute

    const terminationCheckInterval = setInterval(() => {
      checkSessionTermination();
    }, 15 * 1000); // Check for termination more frequently (every 15 seconds)

    // Clean up intervals on unmount
    return () => {
      clearInterval(refreshInterval);
      clearInterval(terminationCheckInterval);
    };
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

  // Check specifically for session termination
  const checkSessionTermination = async (): Promise<void> => {
    // Only check if user is logged in
    if (!user) return;

    try {
      const userId = user.id;
      const response = await fetch(
        `/api/auth/session-status?userId=${userId}`,
        {
          credentials: "include",
          // Use cache: 'no-store' to prevent caching
          cache: "no-store",
          headers: {
            // Add a timestamp to prevent caching
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            "X-Request-Time": Date.now().toString(),
          },
        }
      );

      const data = await response.json();

      if (data.terminated) {
        // Session has been terminated
        console.log("Session termination detected");

        // Clear all auth state
        setUser(null);
        localStorage.removeItem("auth_state");

        // Clear cookies
        document.cookie =
          "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect to terminated page
        window.location.href = "/auth/terminated";
      }
    } catch (error) {
      console.error("Error checking session termination:", error);
      // Don't clear auth state on network errors to prevent false logouts
    }
  };

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
        // Clear auth_session and auth_token, session_id cookies to prevent redirect loop
        document.cookie =
          "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Check for session termination specifically
        if (
          data.error === "Session terminated" ||
          data.redirectTo === "/auth/terminated"
        ) {
          // Use setTimeout to ensure state is cleared before redirect
          setTimeout(() => {
            window.location.href = "/auth/terminated";
          }, 100);
          return;
        }
        // Handle other session termination and authentication errors
        else if (data.redirectTo) {
          // Clear all auth state before redirecting
          setUser(null);
          localStorage.removeItem("auth_state");
          // Use setTimeout to ensure state is cleared before redirect
          setTimeout(() => {
            window.location.href = data.redirectTo;
          }, 100);
          return;
        } else if (window.location.pathname.startsWith("/dashboard")) {
          // Redirect to login if unauthorized access to dashboard
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 100);
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
