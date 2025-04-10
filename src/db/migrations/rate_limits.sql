-- Create rate_limits table
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

-- Create rate_limit_logs table
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

-- Add cleanup procedure for expired rate limits
DELIMITER //
CREATE PROCEDURE cleanup_expired_rate_limits()
BEGIN
  DELETE FROM rate_limits WHERE reset_time < NOW();
  DELETE FROM rate_limit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ;

-- Create event to run cleanup procedure every hour
CREATE EVENT IF NOT EXISTS cleanup_rate_limits_event
ON SCHEDULE EVERY 1 HOUR
DO CALL cleanup_expired_rate_limits(); 