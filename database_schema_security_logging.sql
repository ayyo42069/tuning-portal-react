-- Database Schema for Security Logging

-- Use the database
USE tuning_portal;

-- Create security events table for storing all security-related events
CREATE TABLE IF NOT EXISTS security_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent VARCHAR(255) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_security_events_user (user_id),
  INDEX idx_security_events_type (event_type),
  INDEX idx_security_events_severity (severity),
  INDEX idx_security_events_created (created_at)
);

-- Create security alerts table for tracking unresolved security issues
CREATE TABLE IF NOT EXISTS security_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by INT,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (event_id) REFERENCES security_events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_security_alerts_user (user_id),
  INDEX idx_security_alerts_type (alert_type),
  INDEX idx_security_alerts_resolved (is_resolved)
);

-- Create geographic access table for tracking user access locations
CREATE TABLE IF NOT EXISTS user_access_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_first_access BOOLEAN DEFAULT FALSE,
  is_suspicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_access_locations_user (user_id),
  INDEX idx_user_access_locations_ip (ip_address)
);

-- Add fields to users table for security tracking if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45) NULL COMMENT 'IP address at last login',
ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP NULL COMMENT 'Last login timestamp',
ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0 COMMENT 'Number of failed login attempts',
ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE COMMENT 'Whether account is locked due to suspicious activity',
ADD COLUMN IF NOT EXISTS account_locked_reason VARCHAR(255) NULL COMMENT 'Reason for account lock if applicable',
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP NULL COMMENT 'When account lock expires';

-- Add scheduled event to clean up old security events
DELIMITER //
CREATE EVENT IF NOT EXISTS cleanup_security_events
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
  -- Keep security events for 1 year
  DELETE FROM security_events WHERE created_at < NOW() - INTERVAL 1 YEAR;
  
  -- Keep resolved alerts for 6 months
  DELETE FROM security_alerts WHERE is_resolved = TRUE AND resolved_at < NOW() - INTERVAL 6 MONTH;
  
  -- Keep location data for 1 year
  DELETE FROM user_access_locations WHERE created_at < NOW() - INTERVAL 1 YEAR;
END //
DELIMITER ;