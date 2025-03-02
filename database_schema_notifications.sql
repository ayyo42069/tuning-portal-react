-- Notifications table for storing user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('file_status', 'admin_message', 'credit_transaction', 'system') NOT NULL,
  reference_id INT,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_user_notifications ON notifications(user_id, is_read);
CREATE INDEX idx_global_notifications ON notifications(is_global);

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type, is_global)
VALUES 
(1, 'Welcome to Tuning Portal', 'Thank you for joining our platform!', 'system', false),
(NULL, 'System Maintenance', 'The system will be under maintenance on Saturday.', 'system', true);