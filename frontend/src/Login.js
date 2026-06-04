import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        email: form.email,
        password: form.password
      });
      localStorage.setItem('busUser', JSON.stringify(res.data.user));
      navigate('/buses');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await axios.post('http://localhost:5000/api/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      setMsg('Registered! Please login.');
      setTab('login');
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>🚌 BusBook</h2>
        <p className="login-sub">Online Bus Ticket Booking</p>

        <div className="tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setMsg(''); setError(''); }}>Login</button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setMsg(''); setError(''); }}>Register</button>
        </div>

        {error && <p className="msg error">{error}</p>}
        {msg   && <p className="msg success">{msg}</p>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handle} required placeholder="Enter email" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handle} required placeholder="Enter password" />
            </div>
            <button type="submit" className="btn-primary">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="field">
              <label>Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handle} required placeholder="Enter full name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handle} required placeholder="Enter email" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handle} required placeholder="Create password" />
            </div>
            <button type="submit" className="btn-primary">Register</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
