import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './Login';
import BusList from './BusList';
import BookTicket from './BookTicket';
import MyBookings from './MyBookings';
import Navbar from './Navbar';

// Checks localStorage fresh every time the route renders
function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('busUser') || 'null');
  if (!user) return <Navigate to="/" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/buses"        element={<PrivateRoute><BusList /></PrivateRoute>} />
        <Route path="/book"         element={<PrivateRoute><BookTicket /></PrivateRoute>} />
        <Route path="/my-bookings"  element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
