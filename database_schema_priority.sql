-- Add priority field to ecu_files table if it doesn't exist
ALTER TABLE ecu_files ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;

-- Create index for faster priority-based queries
CREATE INDEX IF NOT EXISTS idx_ecu_files_priority ON ecu_files(priority);