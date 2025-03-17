-- Database Schema for Tuning Portal Application

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tuning_portal;

-- Use the database
USE tuning_portal;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(255),
  preferences JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User credits table for managing credit system
CREATE TABLE IF NOT EXISTS user_credits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Credit transactions table for tracking credit purchases and usage
CREATE TABLE IF NOT EXISTS credit_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT NOT NULL,
  transaction_type ENUM('purchase', 'usage', 'admin_add', 'admin_deduct') NOT NULL,
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Vehicle manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Vehicle models table
CREATE TABLE IF NOT EXISTS vehicle_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  manufacturer_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE CASCADE
);

-- Tuning options table
CREATE TABLE IF NOT EXISTS tuning_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  credit_cost INT NOT NULL DEFAULT 1
);

-- ECU file uploads table
CREATE TABLE IF NOT EXISTS ecu_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  manufacturer_id INT NOT NULL,
  model_id INT NOT NULL,
  production_year INT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  processed_filename VARCHAR(255),
  file_size INT NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  message TEXT,
  estimated_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id),
  FOREIGN KEY (model_id) REFERENCES vehicle_models(id)
);

-- ECU file tuning options junction table
CREATE TABLE IF NOT EXISTS ecu_file_tuning_options (
  ecu_file_id INT NOT NULL,
  tuning_option_id INT NOT NULL,
  PRIMARY KEY (ecu_file_id, tuning_option_id),
  FOREIGN KEY (ecu_file_id) REFERENCES ecu_files(id) ON DELETE CASCADE,
  FOREIGN KEY (tuning_option_id) REFERENCES tuning_options(id) ON DELETE CASCADE
);

-- Insert sample manufacturers
INSERT INTO manufacturers (name) VALUES
('VW'),
('BMW'),
('Audi'),
('Seat');

-- Insert sample vehicle models
INSERT INTO vehicle_models (manufacturer_id, name) VALUES
(1, 'Golf IV'),
(4, 'Leon'),
(2, 'e60'),
(3, 'A4');

-- Insert sample tuning options
INSERT INTO tuning_options (name, description, credit_cost) VALUES
('Stage 1', 'Basic performance optimization', 1),
('Stage 2', 'Advanced performance tuning', 2),
('DPF Remove', 'Diesel particulate filter removal', 1),
('Immo Off', 'Immobilizer deactivation', 1);