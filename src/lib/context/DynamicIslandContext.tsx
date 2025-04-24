"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { DynamicIslandContext as DynamicIslandContextType } from '../types/dynamicIsland';
import { ContextState, ContextAction } from '../types/dynamicIsland';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../AuthProvider';
import { useFeedback } from '../FeedbackProvider';
import {
  Upload,
  CreditCard,
  Download,
  Share,
  Trash,
  Clock,
  X,
  Filter
} from 'lucide-react';

const DynamicIslandContext = createContext<DynamicIslandContextType | undefined>(undefined);

// Error types for better error handling
type ErrorType = 
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string;
  metadata?: Record<string, any>;
}

// Helper function to handle errors
const handleError = (error: unknown, showFeedback: (feedback: any) => void): ErrorDetails => {
  console.error('Operation error:', error);

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      showFeedback({
        type: 'error',
        message: 'Network error. Please check your connection.',
        duration: 5000
      });
      return { type: 'NETWORK_ERROR', message: error.message };
    }

    // Auth errors
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      showFeedback({
        type: 'error',
        message: 'Authentication error. Please log in again.',
        duration: 5000
      });
      return { type: 'AUTH_ERROR', message: error.message };
    }

    // Permission errors
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      showFeedback({
        type: 'error',
        message: 'You don\'t have permission to perform this action.',
        duration: 5000
      });
      return { type: 'PERMISSION_ERROR', message: error.message };
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      showFeedback({
        type: 'warning',
        message: 'Please check your input and try again.',
        duration: 4000
      });
      return { type: 'VALIDATION_ERROR', message: error.message };
    }
  }

  // Default error handling
  showFeedback({
    type: 'error',
    message: 'An unexpected error occurred. Please try again.',
    duration: 5000
  });
  return { type: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
};

export function DynamicIslandProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContextState>({
    currentPage: 'dashboard',
    userCredits: 0,
    isProcessing: false
  });

  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();

  const updateState = useCallback((newState: Partial<ContextState>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Update context based on current page and state
  useEffect(() => {
    const currentPage = pathname.split('/').pop() || 'dashboard';
    updateState({ currentPage });
  }, [pathname, updateState]);

  // Update user credits
  useEffect(() => {
    if (user) {
      updateState({ userCredits: user.credits || 0 });
    }
  }, [user, updateState]);

  // Handler functions with enhanced error handling
  const handleNewUpload = useCallback(() => {
    try {
      if (!user) {
        throw new Error('User must be logged in to upload files');
      }

      if (state.userCredits < 1) {
        showFeedback({
          type: 'warning',
          message: 'You need credits to upload files. Consider purchasing more credits.',
          duration: 5000
        });
        return;
      }

      router.push('/dashboard/upload');
      showFeedback({
        type: 'info',
        message: 'Opening upload form...',
        duration: 2000
      });
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [router, showFeedback, user, state.userCredits]);

  const handleFileDownload = useCallback((fileId: string) => {
    try {
      if (!user) {
        throw new Error('User must be logged in to download files');
      }

      showFeedback({
        type: 'info',
        message: 'Preparing file download...',
        duration: 2000
      });

      // Implement file download logic here
      // After successful download:
      showFeedback({
        type: 'success',
        message: 'File downloaded successfully',
        duration: 3000
      });
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleFileShare = useCallback((fileId: string) => {
    try {
      if (!user) {
        throw new Error('User must be logged in to share files');
      }

      showFeedback({
        type: 'info',
        message: 'Preparing file share...',
        duration: 2000
      });

      // Implement file sharing logic here
      // After successful share:
      showFeedback({
        type: 'success',
        message: 'File shared successfully',
        duration: 3000
      });
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleFileDelete = useCallback((fileId: string) => {
    try {
      if (!user) {
        throw new Error('User must be logged in to delete files');
      }

      // Show confirmation feedback
      showFeedback({
        type: 'warning',
        message: 'Are you sure you want to delete this file?',
        duration: 0 // Keep until user action
      });

      // Implement file deletion logic here
      // After successful deletion:
      showFeedback({
        type: 'success',
        message: 'File deleted successfully',
        duration: 3000
      });
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleViewProgress = useCallback(() => {
    try {
      if (!state.isProcessing) {
        showFeedback({
          type: 'info',
          message: 'No active processing tasks',
          duration: 3000
        });
        return;
      }

      showFeedback({
        type: 'info',
        message: 'Opening progress view...',
        duration: 2000
      });

      // Implement progress view logic here
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, state.isProcessing]);

  const handleCancelProcessing = useCallback(() => {
    try {
      if (!state.isProcessing) {
        showFeedback({
          type: 'warning',
          message: 'No active processing to cancel',
          duration: 3000
        });
        return;
      }

      // Show confirmation feedback
      showFeedback({
        type: 'warning',
        message: 'Are you sure you want to cancel the processing?',
        duration: 0 // Keep until user action
      });

      // Implement cancel processing logic here
      // After successful cancellation:
      showFeedback({
        type: 'success',
        message: 'Processing cancelled successfully',
        duration: 3000
      });
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, state.isProcessing]);

  const handleShowFilters = useCallback(() => {
    try {
      showFeedback({
        type: 'info',
        message: 'Opening filters...',
        duration: 2000
      });

      // Implement filter view logic here
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback]);

  const handleExportHistory = useCallback(() => {
    try {
      if (!user) {
        throw new Error('User must be logged in to export history');
      }

      showFeedback({
        type: 'info',
        message: 'Preparing history export...',
        duration: 2000
      });

      // Implement history export logic here
      // After successful export:
      showFeedback({
        type: 'success',
        message: 'History exported successfully',
        duration: 3000
      });
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const getContextActions = useCallback((): ContextAction[] => {
    const actions: ContextAction[] = [];

    // Dashboard Context
    if (state.currentPage === 'dashboard') {
      actions.push(
        {
          icon: <Upload className="h-5 w-5" />,
          label: "New Upload",
          action: handleNewUpload,
          color: "text-blue-500",
          tooltip: "Upload a new ECU file",
          shortcut: "Ctrl+U"
        },
        {
          icon: <CreditCard className="h-5 w-5" />,
          label: "Buy Credits",
          action: () => router.push('/dashboard/credits'),
          color: "text-green-500",
          condition: () => state.userCredits < 10,
          tooltip: "Purchase more credits",
          shortcut: "Ctrl+B"
        }
      );
    }

    // ECU File View Context
    if (state.currentPage === 'ecu-file' && state.currentFile) {
      const fileId = state.currentFile.id;
      actions.push(
        {
          icon: <Download className="h-5 w-5" />,
          label: "Download",
          action: () => handleFileDownload(fileId),
          color: "text-blue-500",
          tooltip: "Download the current file",
          shortcut: "Ctrl+D"
        },
        {
          icon: <Share className="h-5 w-5" />,
          label: "Share",
          action: () => handleFileShare(fileId),
          color: "text-purple-500",
          tooltip: "Share this file",
          shortcut: "Ctrl+S"
        },
        {
          icon: <Trash className="h-5 w-5" />,
          label: "Delete",
          action: () => handleFileDelete(fileId),
          color: "text-red-500",
          tooltip: "Delete this file",
          shortcut: "Delete"
        }
      );
    }

    // Processing Context
    if (state.isProcessing) {
      actions.push(
        {
          icon: <Clock className="h-5 w-5" />,
          label: "View Progress",
          action: handleViewProgress,
          color: "text-yellow-500",
          tooltip: "View processing progress",
          shortcut: "Ctrl+P"
        },
        {
          icon: <X className="h-5 w-5" />,
          label: "Cancel",
          action: handleCancelProcessing,
          color: "text-red-500",
          tooltip: "Cancel processing",
          shortcut: "Esc"
        }
      );
    }

    // History Context
    if (state.currentPage === 'history') {
      actions.push(
        {
          icon: <Filter className="h-5 w-5" />,
          label: "Filter",
          action: handleShowFilters,
          color: "text-purple-500",
          tooltip: "Filter history",
          shortcut: "Ctrl+F"
        },
        {
          icon: <Download className="h-5 w-5" />,
          label: "Export",
          action: handleExportHistory,
          color: "text-green-500",
          tooltip: "Export history",
          shortcut: "Ctrl+E"
        }
      );
    }

    return actions;
  }, [state, handleNewUpload, handleFileDownload, handleFileShare, handleFileDelete, handleViewProgress, handleCancelProcessing, handleShowFilters, handleExportHistory, router]);

  const value = {
    state,
    setState: updateState,
    actions: getContextActions()
  };

  return (
    <DynamicIslandContext.Provider value={value}>
      {children}
    </DynamicIslandContext.Provider>
  );
}

export function useDynamicIsland() {
  const context = useContext(DynamicIslandContext);
  if (context === undefined) {
    throw new Error('useDynamicIsland must be used within a DynamicIslandProvider');
  }
  return context;
} 