-- SQL script to create the ecu_file_feedback table
CREATE TABLE IF NOT EXISTS ecu_file_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ecu_file_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ecu_file_id) REFERENCES ecu_files(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_file_feedback (user_id, ecu_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample data (optional)
INSERT INTO ecu_file_feedback (ecu_file_id, user_id, rating, comment)
SELECT 
  ef.id, 
  ef.user_id, 
  FLOOR(3 + (RAND() * 3)), -- Random rating between 3 and 5
  CASE 
    WHEN FLOOR(RAND() * 2) = 0 THEN 'Great service, very satisfied with the results!'
    WHEN FLOOR(RAND() * 2) = 0 THEN 'The tuning improved my car\'s performance significantly.'
    ELSE 'Professional and efficient service. Would recommend!'
  END
FROM ecu_files ef
WHERE ef.status = 'completed'
AND NOT EXISTS (
  SELECT 1 FROM ecu_file_feedback eff WHERE eff.ecu_file_id = ef.id AND eff.user_id = ef.user_id
)
LIMIT 10; 