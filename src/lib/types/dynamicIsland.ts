import { ReactNode } from 'react';

export interface ContextAction {
  icon: ReactNode;
  label: string;
  action: () => void;
  color: string;
  condition?: () => boolean;
  tooltip?: string;
  shortcut?: string;
}

export interface ContextState {
  currentPage: string;
  currentFile?: {
    id: string;
    name: string;
    status: string;
  };
  userCredits: number;
  isProcessing: boolean;
  lastAction?: string;
  showUploadForm: boolean;
}

export interface DynamicIslandContext {
  state: ContextState;
  setState: (state: Partial<ContextState>) => void;
  actions: ContextAction[];
  showUploadForm: boolean;
  closeUploadForm: () => void;
} 