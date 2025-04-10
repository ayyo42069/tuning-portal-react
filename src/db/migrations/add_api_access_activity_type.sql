-- Add api_access to activity_type ENUM in user_activity_logs table
ALTER TABLE user_activity_logs
MODIFY COLUMN activity_type ENUM('login', 'logout', 'registration', 'password_reset', 'email_verification', 'profile_update', 'failed_login', 'api_access') NOT NULL; 