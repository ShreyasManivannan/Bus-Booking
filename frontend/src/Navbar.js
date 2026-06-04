import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('busUser') || 'null');

  function logout() {
    localStorage.removeItem('busUser');
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="nav-logo">🚌 BusBook</div>
      <div className="nav-links">
        <Link to="/buses" className={location.pathname === '/buses' ? 'active' : ''}>Buses</Link>
        <Link to="/book" className={location.pathname === '/book' ? 'active' : ''}>Book Ticket</Link>
        <Link to="/my-bookings" className={location.pathname === '/my-bookings' ? 'active' : ''}>My Bookings</Link>
      </div>
      <div className="nav-right">
        <span>Hi, {user?.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
