// Chat related types

export type ChatMessage = {
  id: number;
  senderId: number;
  senderUsername: string;
  senderRole: string;
  recipientId?: number;
  recipientUsername?: string;
  message: string;
  isPrivate: boolean;
  isEdited: boolean;
  editedBy?: number;
  editorUsername?: string;
  createdAt: string;
  updatedAt?: string;
};

export type User = {
  id: number;
  username: string;
  role: string;
};

export type ChatBoxProps = {
  currentUser: User;
};

export type ModerationInfo = {
  user_id: number;
  username: string;
  reason: string;
  is_permanent?: boolean;
  expires_at: string;
};

export type PrivateConversation = {
  [key: string]: { user: User; messages: ChatMessage[] };
};