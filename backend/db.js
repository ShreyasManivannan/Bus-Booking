const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
}).promise();

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS buses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_name VARCHAR(100) NOT NULL,
        reg_number VARCHAR(50) UNIQUE NOT NULL,
        from_location VARCHAR(100) NOT NULL,
        to_location VARCHAR(100) NOT NULL,
        departure_time VARCHAR(20) NOT NULL,
        total_seats INT DEFAULT 40,
        price DECIMAL(10,2) DEFAULT 0.00
      )
    `);

    // Add price column if buses table already exists without it
    await pool.query(`
      ALTER TABLE buses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00
    `).catch(() => {});

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        age INT NOT NULL,
        gender ENUM('Male','Female','Other') NOT NULL,
        email VARCHAR(100) NOT NULL,
        bus_name VARCHAR(100) NOT NULL,
        reg_number VARCHAR(50) NOT NULL,
        from_location VARCHAR(100) NOT NULL,
        to_location VARCHAR(100) NOT NULL,
        travel_date DATE NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables ready.');
  } catch (err) {
    console.error('DB Error:', err.message);
  }
}

init();
module.exports = pool;
