import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyBookings() {
  const user = JSON.parse(localStorage.getItem('busUser') || 'null');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/${user?.email}`);
        setBookings(res.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetch();
  }, [user?.email]);

  if (loading) return <div className="page"><p>Loading your bookings...</p></div>;

  // Split into upcoming and past
  const upcoming = bookings.filter(b => b.travel_date.split('T')[0] >= today);
  const past     = bookings.filter(b => b.travel_date.split('T')[0] <  today);

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function BookingTable({ list }) {
    if (list.length === 0) return <p className="empty" style={{ padding: '16px 0', textAlign: 'left' }}>No tickets in this section.</p>;
    return (
      <div className="table-wrap">
        <table className="booking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bus Name</th>
              <th>Reg No</th>
              <th>From</th>
              <th>To</th>
              <th>Travel Date</th>
              <th>Seat</th>
              <th>Passenger</th>
              <th>Phone</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Booked On</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.bus_name}</td>
                <td>{b.reg_number}</td>
                <td>{b.from_location}</td>
                <td>{b.to_location}</td>
                <td>{formatDate(b.travel_date)}</td>
                <td><span className="seat-badge">{b.seat_number}</span></td>
                <td>{b.customer_name}</td>
                <td>{b.phone}</td>
                <td>{b.age}</td>
                <td>{b.gender}</td>
                <td>{b.email}</td>
                <td>{formatDate(b.booked_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="empty">You have no bookings yet. Go to <strong>Book Ticket</strong> to book one.</p>
      ) : (
        <>
          {/* Current / Upcoming Tickets */}
          <div className="booking-section-header">
            <span className="section-icon">🟢</span>
            <h3>Current &amp; Upcoming Tickets</h3>
            <span className="ticket-count">{upcoming.length} ticket{upcoming.length !== 1 ? 's' : ''}</span>
          </div>
          <BookingTable list={upcoming} />

          {/* Past / History */}
          <div className="booking-section-header" style={{ marginTop: '32px' }}>
            <span className="section-icon">🕐</span>
            <h3>Travel History (Past Tickets)</h3>
            <span className="ticket-count">{past.length} ticket{past.length !== 1 ? 's' : ''}</span>
          </div>
          <BookingTable list={past} />
        </>
      )}
    </div>
  );
}

export default MyBookings;
