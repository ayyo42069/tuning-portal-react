-- Database Schema for Email Logs

-- Use the database
USE tuning_portal;

-- Create email logs table for tracking all sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- verification, notification, marketing, etc.
  message_id VARCHAR(255), -- Message ID returned by email provider
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (recipient_email),
  INDEX (email_type),
  INDEX (sent_at)
);

-- Create user activity logs table for tracking email-related activities
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  activity_type VARCHAR(50) NOT NULL, -- email_verification, email_consent, unsubscribe, etc.
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (user_id),
  INDEX (activity_type),
  INDEX (created_at)
);

-- Add consent tracking to users table
ALTER TABLE users
ADD COLUMN email_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN email_consent_date TIMESTAMP NULL,
ADD COLUMN unsubscribed BOOLEAN DEFAULT FALSE,
ADD COLUMN unsubscribed_date TIMESTAMP NULL;