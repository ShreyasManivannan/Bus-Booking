-- =============================================
--  BUS TICKET BOOKING - DATABASE SETUP
--  Run this in MySQL Workbench
-- =============================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS bus_booking;
USE bus_booking;

-- =============================================
-- Table 1: users  (Login details)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table 2: buses  (Bus listings)
-- =============================================
CREATE TABLE IF NOT EXISTS buses (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  bus_name       VARCHAR(100) NOT NULL,
  reg_number     VARCHAR(50)  NOT NULL UNIQUE,
  from_location  VARCHAR(100) NOT NULL,
  to_location    VARCHAR(100) NOT NULL,
  departure_time VARCHAR(20)  NOT NULL,
  total_seats    INT DEFAULT 40
);

-- =============================================
-- Table 3: bookings  (Customer booking details)
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  phone         VARCHAR(15)  NOT NULL,
  age           INT          NOT NULL,
  gender        ENUM('Male','Female','Other') NOT NULL,
  email         VARCHAR(100) NOT NULL,
  bus_name      VARCHAR(100) NOT NULL,
  reg_number    VARCHAR(50)  NOT NULL,
  from_location VARCHAR(100) NOT NULL,
  to_location   VARCHAR(100) NOT NULL,
  travel_date   DATE         NOT NULL,
  seat_number   VARCHAR(10)  NOT NULL,
  booked_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Done! Check your tables:
-- =============================================
SHOW TABLES;
