-- Database Schema for Rate Limiting

-- Use the database
USE tuning_portal;

-- Create rate limits table for tracking request limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_identifier VARCHAR(255) NOT NULL,
  count INT NOT NULL DEFAULT 1,
  reset_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key_identifier (key_identifier),
  INDEX idx_reset_time (reset_time)
);

-- Create rate limit logs table for monitoring and analysis
CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_identifier VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  success BOOLEAN NOT NULL,
  remaining INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_key_identifier (key_identifier),
  INDEX idx_created_at (created_at)
);

-- Add a scheduled event to clean up old rate limit entries
DELIMITER //
CREATE EVENT IF NOT EXISTS cleanup_rate_limits
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
  -- Delete expired rate limits
  DELETE FROM rate_limits WHERE reset_time < NOW() - INTERVAL 1 DAY;
  
  -- Delete old rate limit logs (keep 30 days of history)
  DELETE FROM rate_limit_logs WHERE created_at < NOW() - INTERVAL 30 DAY;
END //
DELIMITER ;