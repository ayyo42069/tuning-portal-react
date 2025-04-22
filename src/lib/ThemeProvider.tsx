"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from cookies on component mount
  useEffect(() => {
    setMounted(true);
    const storedTheme = Cookies.get("theme") as Theme | undefined;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.setAttribute('data-theme', 'dark');
      Cookies.set("theme", "dark", { expires: 365 });
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // Update HTML data attribute and cookie when theme changes
  useEffect(() => {
    if (!mounted) return;

    document.documentElement.setAttribute('data-theme', theme);
    Cookies.set("theme", theme, { expires: 365 });
  }, [theme, mounted]);

  const toggleTheme = useMemo(
    () => () => {
      setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    },
    []
  );

  const contextValue = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
