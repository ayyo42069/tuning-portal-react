/**
 * Types related to authentication and password reset functionality
 */

/**
 * Interface for user data returned from database queries
 */
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  credits?: number;
  email_verified: boolean;
  is_active?: number;
  last_login_date?: string;
  registration_date?: string;
  created_at?: string;
  updated_at?: string;
  is_banned?: boolean;
  ban_reason?: string | null;
  ban_expires_at?: string | null;
}

/**
 * Interface for password reset token data returned from database queries
 */
export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: number;
  used_at?: Date;
  created_at?: Date;
  username?: string;
  email?: string;
}
