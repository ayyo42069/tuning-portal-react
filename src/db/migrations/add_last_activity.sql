-- Add last_activity column to sessions table
ALTER TABLE sessions
ADD COLUMN last_activity TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing sessions to have last_activity set to created_at
UPDATE sessions SET last_activity = created_at WHERE last_activity IS NULL;

-- Create an index for better performance when querying by last_activity
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity); 