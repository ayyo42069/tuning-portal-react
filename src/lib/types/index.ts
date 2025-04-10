/**
 * This file exports all types from the types directory
 */

export * from "../types";

/**
 * Interface for user session data
 */
export interface Session {
  id: string;
  user_id: number;
  username?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
}
