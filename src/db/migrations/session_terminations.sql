-- Create session_terminations table to track terminated sessions
CREATE TABLE IF NOT EXISTS session_terminations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  terminated_by INT NOT NULL,
  terminated_at DATETIME NOT NULL,
  reason VARCHAR(255),
  acknowledged BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (terminated_by) REFERENCES users(id)
);

-- Add index for faster lookups
CREATE INDEX idx_session_terminations_user_id ON session_terminations(user_id);