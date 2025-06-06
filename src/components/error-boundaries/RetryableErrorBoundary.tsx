"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  fallback?: ReactNode;
  errorType?: 'network' | 'query' | 'server' | 'general';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RetryableErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private getErrorIcon = () => {
    switch (this.props.errorType) {
      case 'network':
        return <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />;
      case 'query':
        return <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400" />;
      case 'server':
        return <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />;
    }
  };

  private getErrorMessage = () => {
    switch (this.props.errorType) {
      case 'network':
        return "Network connection error. Please check your internet connection.";
      case 'query':
        return "Failed to fetch data. Please try again.";
      case 'server':
        return "Server error. Please try again later.";
      default:
        return this.state.error?.message || "An unexpected error occurred";
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm shadow-xl rounded-xl border border-white/10 dark:border-gray-700/30 p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100/80 dark:bg-red-900/30 rounded-full">
                {this.getErrorIcon()}
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {this.getErrorMessage()}
            </p>
            <div className="flex justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RetryableErrorBoundary; 