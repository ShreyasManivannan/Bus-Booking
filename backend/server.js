const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── AUTH ─────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hashed]);
    res.json({ message: 'Registered successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ message: 'Login successful', user: { id: rows[0].id, name: rows[0].name, email: rows[0].email } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── BUSES ────────────────────────────────────────────

// Get all buses
app.get('/api/buses', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM buses ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Add a bus (with price)
app.post('/api/buses', async (req, res) => {
  const { bus_name, reg_number, from_location, to_location, departure_time, total_seats, price } = req.body;
  if (!bus_name || !reg_number || !from_location || !to_location || !departure_time || !price)
    return res.status(400).json({ message: 'All fields required including price' });
  try {
    const [ex] = await db.query('SELECT id FROM buses WHERE reg_number=?', [reg_number]);
    if (ex.length) return res.status(409).json({ message: 'Bus with this reg number already exists' });
    await db.query(
      'INSERT INTO buses (bus_name,reg_number,from_location,to_location,departure_time,total_seats,price) VALUES (?,?,?,?,?,?,?)',
      [bus_name, reg_number, from_location, to_location, departure_time, total_seats || 40, price]
    );
    res.json({ message: 'Bus added successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Delete a bus
app.delete('/api/buses/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM buses WHERE id=?', [req.params.id]);
    res.json({ message: 'Bus deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Search buses by from & to
app.get('/api/buses/search', async (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to || !date)
    return res.status(400).json({ message: 'from, to and date required' });
  try {
    const [buses] = await db.query(
      'SELECT * FROM buses WHERE from_location=? AND to_location=?', [from, to]
    );
    const result = await Promise.all(buses.map(async (bus) => {
      const [booked] = await db.query(
        'SELECT seat_number FROM bookings WHERE reg_number=? AND travel_date=?',
        [bus.reg_number, date]
      );
      return { ...bus, bookedSeats: booked.map(b => b.seat_number) };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get booked seats for a bus on a date (used when all buses shown)
app.get('/api/seats', async (req, res) => {
  const { reg_number, date } = req.query;
  if (!reg_number || !date)
    return res.status(400).json({ message: 'reg_number and date required' });
  try {
    const [booked] = await db.query(
      'SELECT seat_number FROM bookings WHERE reg_number=? AND travel_date=?',
      [reg_number, date]
    );
    res.json(booked.map(b => b.seat_number));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── BOOKINGS ─────────────────────────────────────────

app.post('/api/bookings', async (req, res) => {
  const { customer_name, phone, age, gender, email, bus_name, reg_number, from_location, to_location, travel_date, seat_number } = req.body;
  if (!customer_name || !phone || !age || !gender || !email || !bus_name || !reg_number || !travel_date || !seat_number)
    return res.status(400).json({ message: 'All fields required' });
  try {
    const [check] = await db.query(
      'SELECT id FROM bookings WHERE reg_number=? AND travel_date=? AND seat_number=?',
      [reg_number, travel_date, seat_number]
    );
    if (check.length) return res.status(409).json({ message: 'Seat already booked for this date' });
    await db.query(
      'INSERT INTO bookings (customer_name,phone,age,gender,email,bus_name,reg_number,from_location,to_location,travel_date,seat_number) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [customer_name, phone, age, gender, email, bus_name, reg_number, from_location, to_location, travel_date, seat_number]
    );
    res.json({ message: 'Ticket booked successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings ORDER BY booked_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/bookings/:email', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE email=? ORDER BY booked_at DESC',
      [req.params.email]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── START ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
