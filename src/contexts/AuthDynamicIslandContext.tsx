"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthDynamicIslandState {
  status: "idle" | "loading" | "success" | "error";
  progress: number;
  message: string;
  validationErrors: Record<string, string>;
}

interface AuthDynamicIslandContextType {
  state: AuthDynamicIslandState;
  setStatus: (status: AuthDynamicIslandState["status"]) => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  reset: () => void;
}

const initialState: AuthDynamicIslandState = {
  status: "idle",
  progress: 0,
  message: "",
  validationErrors: {},
};

const AuthDynamicIslandContext = createContext<AuthDynamicIslandContextType | undefined>(undefined);

export function AuthDynamicIslandProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthDynamicIslandState>(initialState);

  const setStatus = (status: AuthDynamicIslandState["status"]) => {
    setState(prev => ({ ...prev, status }));
  };

  const setProgress = (progress: number) => {
    setState(prev => ({ ...prev, progress }));
  };

  const setMessage = (message: string) => {
    setState(prev => ({ ...prev, message }));
  };

  const setValidationErrors = (errors: Record<string, string>) => {
    setState(prev => ({ ...prev, validationErrors: errors }));
  };

  const reset = () => {
    setState(initialState);
  };

  return (
    <AuthDynamicIslandContext.Provider
      value={{
        state,
        setStatus,
        setProgress,
        setMessage,
        setValidationErrors,
        reset,
      }}
    >
      {children}
    </AuthDynamicIslandContext.Provider>
  );
}

export function useAuthDynamicIsland() {
  const context = useContext(AuthDynamicIslandContext);
  if (context === undefined) {
    throw new Error("useAuthDynamicIsland must be used within an AuthDynamicIslandProvider");
  }
  return context;
} 