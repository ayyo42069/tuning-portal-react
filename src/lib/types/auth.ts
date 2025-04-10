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
  role?: string;
  is_active?: number;
  created_at?: string;
  last_login?: string;
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
