CREATE TABLE IF NOT EXISTS feedback_events (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type ENUM('success', 'error', 'info', 'warning') NOT NULL,
  message VARCHAR(255) NOT NULL,
  user_id INT,
  action VARCHAR(50),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 