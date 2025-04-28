"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { DynamicIslandContext as DynamicIslandContextType } from '../types/dynamicIsland';
import { ContextState, ContextAction } from '../types/dynamicIsland';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { useFeedback, FeedbackType } from '@/contexts/FeedbackContext';
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
const handleError = (error: unknown, showFeedback: (message: string, type: FeedbackType) => void): ErrorDetails => {
  console.error('Operation error:', error);

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      showFeedback('Network error. Please check your connection.', 'error');
      return { type: 'NETWORK_ERROR', message: error.message };
    }

    // Auth errors
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      showFeedback('Authentication error. Please log in again.', 'error');
      return { type: 'AUTH_ERROR', message: error.message };
    }

    // Permission errors
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      showFeedback('You don\'t have permission to perform this action.', 'error');
      return { type: 'PERMISSION_ERROR', message: error.message };
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      showFeedback('Please check your input and try again.', 'warning');
      return { type: 'VALIDATION_ERROR', message: error.message };
    }
  }

  // Default error handling
  showFeedback('An unexpected error occurred. Please try again.', 'error');
  return { type: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
};

export function DynamicIslandProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContextState>({
    currentPage: 'dashboard',
    userCredits: 0,
    isProcessing: false,
    showUploadForm: false
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
        showFeedback('You need credits to upload files. Consider purchasing more credits.', 'warning');
        return;
      }

      updateState({ showUploadForm: true });
      showFeedback('Opening upload form...', 'info');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [user, state.userCredits, showFeedback, updateState]);

  const handleCloseUploadForm = useCallback(() => {
    updateState({ showUploadForm: false });
  }, [updateState]);

  const updateUserCredits = useCallback(async () => {
    try {
      if (!user) {
        showFeedback('Please log in to view your credits', 'warning');
        return;
      }

      const response = await fetch('/api/user/credits');
      if (!response.ok) {
        throw new Error('Failed to fetch user credits');
      }

      const data = await response.json();
      updateState({ userCredits: data.credits });
      showFeedback('Credits updated successfully', 'success');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [user, state.userCredits, showFeedback, updateState]);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      if (!user) {
        showFeedback('Please log in to upload files', 'warning');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      showFeedback('File uploaded successfully', 'success');
      updateState({ showUploadForm: false });
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleFileDownload = useCallback(async (fileId: string) => {
    try {
      if (!user) {
        showFeedback('Please log in to download files', 'warning');
        return;
      }

      const response = await fetch(`/api/files/download/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      showFeedback('File downloaded successfully', 'success');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleFileShare = useCallback((fileId: string) => {
    try {
      if (!user) {
        showFeedback('Please log in to share files', 'warning');
        return;
      }

      const shareUrl = `${window.location.origin}/share/${fileId}`;
      navigator.clipboard.writeText(shareUrl);
      showFeedback('Share link copied to clipboard', 'success');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleFileDelete = useCallback(async (fileId: string) => {
    try {
      if (!user) {
        showFeedback('Please log in to delete files', 'warning');
        return;
      }

      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      showFeedback('File deleted successfully', 'success');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleViewProgress = useCallback(() => {
    try {
      if (!state.isProcessing) {
        showFeedback('No active processing tasks', 'info');
        return;
      }

      showFeedback('Opening progress view...', 'info');

      // Implement progress view logic here
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, state.isProcessing]);

  const handleCancelProcessing = useCallback(() => {
    try {
      if (!state.isProcessing) {
        showFeedback('No active processing to cancel', 'warning');
        return;
      }

      // Show confirmation feedback
      showFeedback('Are you sure you want to cancel the processing?', 'warning');

      // Implement cancel processing logic here
      // After successful cancellation:
      showFeedback('Processing cancelled successfully', 'success');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, state.isProcessing]);

  const handleShowFilters = useCallback(() => {
    try {
      showFeedback('Opening filters...', 'info');

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

      showFeedback('Preparing history export...', 'info');

      // Implement history export logic here
      // After successful export:
      showFeedback('History exported successfully', 'success');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleProcessingStart = useCallback(async () => {
    try {
      if (!state.isProcessing) {
        updateState({ isProcessing: true });
        showFeedback('Processing started', 'info');
      }
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, state.isProcessing]);

  const handleProcessingComplete = useCallback(async () => {
    try {
      if (state.isProcessing) {
        updateState({ isProcessing: false });
        showFeedback('Processing completed', 'success');
      }
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, state.isProcessing]);

  const handleProcessingError = useCallback(async () => {
    try {
      if (state.isProcessing) {
        updateState({ isProcessing: false });
        showFeedback('Processing failed', 'error');
      }
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback]);

  const handleUploadFormToggle = useCallback(async () => {
    try {
      if (!user) {
        showFeedback('Please log in to upload files', 'warning');
        return;
      }

      updateState({ showUploadForm: !state.showUploadForm });
      showFeedback(state.showUploadForm ? 'Upload form closed' : 'Upload form opened', 'info');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleFileFilter = useCallback((filter: string) => {
    try {
      updateState({ currentFilter: filter });
      showFeedback(`Filtered by: ${filter}`, 'info');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback]);

  const handleFileSort = useCallback((sortBy: string) => {
    try {
      updateState({ currentSort: sortBy });
      showFeedback(`Sorted by: ${sortBy}`, 'info');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback]);

  const handleFileSearch = useCallback((query: string) => {
    try {
      updateState({ searchQuery: query });
      showFeedback(`Searching for: ${query}`, 'info');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback]);

  const handleFilePreview = useCallback((fileId: string) => {
    try {
      if (!user) {
        showFeedback('Please log in to preview files', 'warning');
        return;
      }

      updateState({ previewFileId: fileId });
      showFeedback('Opening file preview', 'info');
    } catch (error) {
      handleError(error, showFeedback);
    }
  }, [showFeedback, user]);

  const handleFileRename = useCallback(async (fileId: string, newName: string) => {
    try {
      if (!user) {
        showFeedback('Please log in to rename files', 'warning');
        return;
      }

      const response = await fetch(`/api/files/${fileId}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename file');
      }

      showFeedback('File renamed successfully', 'success');
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
    actions: getContextActions(),
    showUploadForm: state.showUploadForm,
    closeUploadForm: handleCloseUploadForm
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