-- Database Schema for User Banning System

-- Use the database
USE tuning_portal;

-- Add ban-related fields to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE COMMENT 'Whether user is banned from the platform',
ADD COLUMN IF NOT EXISTS ban_reason TEXT NULL COMMENT 'Reason for the ban',
ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMP NULL COMMENT 'When the ban expires, NULL for permanent bans',
ADD COLUMN IF NOT EXISTS banned_by INT NULL COMMENT 'Admin who issued the ban',
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP NULL COMMENT 'When the ban was issued',
ADD FOREIGN KEY IF NOT EXISTS (banned_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster queries on banned users
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(is_banned);
CREATE INDEX IF NOT EXISTS idx_users_ban_expires ON users(ban_expires_at);

-- Create a scheduled event to automatically unban users when their ban expires
DELIMITER //
CREATE EVENT IF NOT EXISTS unban_expired_users
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  -- Unban users whose ban has expired
  UPDATE users 
  SET is_banned = FALSE, 
      ban_reason = NULL, 
      ban_expires_at = NULL, 
      banned_by = NULL, 
      banned_at = NULL 
  WHERE is_banned = TRUE 
    AND ban_expires_at IS NOT NULL 
    AND ban_expires_at <= NOW();
END //
DELIMITER ;