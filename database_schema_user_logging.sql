-- Database Schema for Enhanced User Logging

-- Use the database
USE tuning_portal;

-- Add logging fields to users table
ALTER TABLE users
ADD COLUMN registration_ip VARCHAR(45) NULL COMMENT 'IP address at registration time',
ADD COLUMN last_login_ip VARCHAR(45) NULL COMMENT 'IP address at last login',
ADD COLUMN registration_date TIMESTAMP NULL COMMENT 'Exact registration timestamp',
ADD COLUMN last_login_date TIMESTAMP NULL COMMENT 'Last login timestamp',
ADD COLUMN user_agent VARCHAR(255) NULL COMMENT 'User agent at registration',
ADD COLUMN login_attempts INT DEFAULT 0 COMMENT 'Number of failed login attempts',
ADD COLUMN account_locked BOOLEAN DEFAULT FALSE COMMENT 'Whether account is locked due to suspicious activity',
ADD COLUMN account_locked_reason VARCHAR(255) NULL COMMENT 'Reason for account lock if applicable',
ADD COLUMN account_locked_until TIMESTAMP NULL COMMENT 'When account lock expires';

-- Create user activity logs table for security monitoring
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  activity_type ENUM('login', 'logout', 'registration', 'password_reset', 'email_verification', 'profile_update', 'failed_login') NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent VARCHAR(255) NOT NULL,
  details JSON NULL COMMENT 'Additional activity details',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for faster querying of logs
CREATE INDEX idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created ON user_activity_logs(created_at);

-- Create function to log user activity
DELIMITER //
CREATE FUNCTION log_user_activity(
  p_user_id INT,
  p_activity_type VARCHAR(50),
  p_ip_address VARCHAR(45),
  p_user_agent VARCHAR(255),
  p_details JSON
) RETURNS INT
BEGIN
  INSERT INTO user_activity_logs (user_id, activity_type, ip_address, user_agent, details)
  VALUES (p_user_id, p_activity_type, p_ip_address, p_user_agent, p_details);
  
  RETURN LAST_INSERT_ID();
END //
DELIMITER ;