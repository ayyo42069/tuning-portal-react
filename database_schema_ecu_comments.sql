-- ECU File Comments table for storing user and admin comments on ECU files
CREATE TABLE IF NOT EXISTS ecu_file_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ecu_file_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ecu_file_id) REFERENCES ecu_files(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_ecu_file_comments ON ecu_file_comments(ecu_file_id);