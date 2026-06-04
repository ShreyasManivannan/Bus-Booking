import React, { useState, useEffect } from 'react';
import axios from 'axios';

const today = new Date().toISOString().split('T')[0];

function BookTicket() {
  const user = JSON.parse(localStorage.getItem('busUser') || 'null');

  const [search, setSearch]     = useState({ from: '', to: '', date: today });
  const [allBuses, setAllBuses] = useState([]);
  const [buses, setBuses]       = useState([]);
  const [searched, setSearched] = useState(false);

  const [selectedBus, setSelectedBus]   = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // multiple seats
  const [bookedSeats, setBookedSeats]   = useState([]);

  // Step: 'seats' → 'details' → 'summary'
  const [step, setStep] = useState('seats');

  const [details, setDetails] = useState({
    customer_name: '', phone: '', age: '', gender: 'Male', email: user?.email || ''
  });

  const [msg, setMsg]     = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/buses')
      .then(res => { setAllBuses(res.data); setBuses(res.data); })
      .catch(() => {});
  }, []);

  async function searchBuses(e) {
    e.preventDefault();
    setMsg(''); setError('');
    setSelectedBus(null); setSelectedSeats([]); setBookedSeats([]);
    try {
      const res = await axios.get('http://localhost:5000/api/buses/search', {
        params: { from: search.from, to: search.to, date: search.date }
      });
      setBuses(res.data);
      setSearched(true);
    } catch { setError('Search failed. Try again.'); }
  }

  function clearSearch() {
    setSearch({ from: '', to: '', date: today });
    setBuses(allBuses);
    setSearched(false);
    setSelectedBus(null); setSelectedSeats([]); setBookedSeats([]);
    setMsg(''); setError(''); setStep('seats');
  }

  async function selectBus(bus) {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setStep('seats');
    setMsg(''); setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/seats', {
        params: { reg_number: bus.reg_number, date: search.date }
      });
      setBookedSeats(res.data);
    } catch { setBookedSeats([]); }
  }

  // Toggle seat selection
  function toggleSeat(seatNo) {
    setSelectedSeats(prev =>
      prev.includes(seatNo)
        ? prev.filter(s => s !== seatNo)   // deselect
        : [...prev, seatNo]                // select
    );
  }

  function handleDetail(e) {
    setDetails({ ...details, [e.target.name]: e.target.value });
  }

  // Step 1 → Step 2
  function goToDetails(e) {
    e.preventDefault();
    if (selectedSeats.length === 0) { setError('Please select at least one seat'); return; }
    setError('');
    setStep('details');
  }

  // Step 2 → Step 3
  function goToSummary(e) {
    e.preventDefault();
    setStep('summary');
  }

  // Final confirm — book one row per seat
  async function confirmBooking() {
    setLoading(true); setError('');
    try {
      for (const seat of selectedSeats) {
        await axios.post('http://localhost:5000/api/bookings', {
          ...details,
          bus_name:      selectedBus.bus_name,
          reg_number:    selectedBus.reg_number,
          from_location: selectedBus.from_location,
          to_location:   selectedBus.to_location,
          travel_date:   search.date,
          seat_number:   seat
        });
      }
      setMsg(`✅   ${selectedSeats.length} ticket(s) booked on ${selectedBus.bus_name}!`);
      setBookedSeats(prev => [...prev, ...selectedSeats]);
      setSelectedSeats([]);
      setSelectedBus(null);
      setStep('seats');
      setDetails({ customer_name: '', phone: '', age: '', gender: 'Male', email: user?.email || '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setStep('details');
    }
    setLoading(false);
  }

  const pricePerSeat = parseFloat(selectedBus?.price) || 0;
  const totalPrice = selectedSeats.length * pricePerSeat;

  function renderSeats(bus) {
    const cells = [];
    for (let i = 1; i <= bus.total_seats; i++) {
      const seatNo = `S${i}`;
      const isBooked   = bookedSeats.includes(seatNo);
      const isSelected = selectedSeats.includes(seatNo);
      cells.push(
        <button
          key={seatNo}
          type="button"
          className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
          disabled={isBooked}
          onClick={() => !isBooked && toggleSeat(seatNo)}
          title={isBooked ? 'Already booked' : isSelected ? 'Click to deselect' : `Select Seat ${seatNo}`}
        >
          {seatNo}
        </button>
      );
    }
    return cells;
  }

  return (
    <div className="page">
      <h2>Book a Ticket</h2>

      {/* ── Search Bar ────────────────────*/}
      <div className="form-card">
        <form onSubmit={searchBuses}>
          <div className="form-row-3">
            <div className="field">
              <label>From</label>
              <input value={search.from} onChange={e => setSearch({ ...search, from: e.target.value })} placeholder="e.g. Bangalore" />
            </div>
            <div className="field">
              <label>To</label>
              <input value={search.to} onChange={e => setSearch({ ...search, to: e.target.value })} placeholder="e.g. Mysore" />
            </div>
            <div className="field">
              <label>Travel Date</label>
              <input type="date" value={search.date} min={today} onChange={e => setSearch({ ...search, date: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Search Buses</button>
            {searched && <button type="button" className="btn-outline" onClick={clearSearch}>Clear / Show All</button>}
          </div>
        </form>
      </div>

      {error && <p className="msg error">{error}</p>}
      {msg   && <p className="msg success">{msg}</p>}

      <h3 className="section-label">
        {searched ? `Results for "${search.from} → ${search.to}"` : 'All Available Buses'}
        <span className="bus-count">{buses.length} bus{buses.length !== 1 ? 'es' : ''}</span>
      </h3>

      {buses.length === 0 && <p className="empty">No buses found.</p>}

      {buses.map(bus => (
        <div className="bus-result" key={bus.id}>

          {/* Bus header */}
          <div className="bus-result-header">
            <div>
              <h3>{bus.bus_name} <span className="reg">{bus.reg_number}</span></h3>
              <p>{bus.from_location} → {bus.to_location} &nbsp;|&nbsp; 🕐 {bus.departure_time} &nbsp;|&nbsp; 💺 {bus.total_seats} seats</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="price-tag big">₹ {(parseFloat(bus.price) || 0).toLocaleString('en-IN')}</div>
              <small style={{ color: '#888' }}>per seat</small>
            </div>
            <button
              className="btn-primary"
              style={{ width: 'auto' }}
              onClick={() => selectedBus?.id === bus.id ? (setSelectedBus(null), setStep('seats')) : selectBus(bus)}
            >
              {selectedBus?.id === bus.id ? 'Close ✕' : 'Select →'}
            </button>
          </div>

          {/* Expanded booking area */}
          {selectedBus?.id === bus.id && (
            <div className="booking-section">

              {/* ── Step 1: Seat Selection ─── */}
              {step === 'seats' && (
                <>
                  <h4>Step 1 — Select Seat(s)</h4>
                  <div className="seat-legend">
                    <span><span className="dot available"></span> Available</span>
                    <span><span className="dot booked"></span> Booked</span>
                    <span><span className="dot selected"></span> Selected</span>
                  </div>
                  <div className="seat-grid">{renderSeats(bus)}</div>

                  {/* Live running total */}
                  {selectedSeats.length > 0 && (
                    <div className="live-total">
                      <div className="live-total-row">
                        <span>Selected Seats:</span>
                        <strong>{selectedSeats.join(', ')}</strong>
                      </div>
                      <div className="live-total-row">
                        <span>Seats Count:</span>
                        <strong>{selectedSeats.length}</strong>
                      </div>
                      <div className="live-total-row">
                        <span>Price per Seat:</span>
                        <strong>₹ {(parseFloat(bus.price) || 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="live-total-row total-line">
                        <span>Total Amount:</span>
                        <strong>₹ {(selectedSeats.length * (parseFloat(bus.price) || 0)).toLocaleString('en-IN')}</strong>
                      </div>
                      <form onSubmit={goToDetails} style={{ marginTop: '12px' }}>
                        <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                          Next: Fill Details →
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}

              {/* ── Step 2: Passenger Details ─── */}
              {step === 'details' && (
                <>
                  <h4>Step 2 — Passenger Details</h4>
                  <form onSubmit={goToSummary}>
                    <div className="form-row">
                      <div className="field">
                        <label>Full Name</label>
                        <input name="customer_name" value={details.customer_name} onChange={handleDetail} required placeholder="Passenger name" />
                      </div>
                      <div className="field">
                        <label>Phone Number</label>
                        <input name="phone" value={details.phone} onChange={handleDetail} required placeholder="10-digit number" maxLength={10} />
                      </div>
                    </div>
                    <div className="form-row-3">
                      <div className="field">
                        <label>Age</label>
                        <input type="number" name="age" value={details.age} onChange={handleDetail} required min="1" max="120" placeholder="Age" />
                      </div>
                      <div className="field">
                        <label>Gender</label>
                        <select name="gender" value={details.gender} onChange={handleDetail}>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Email ID</label>
                        <input type="email" name="email" value={details.email} onChange={handleDetail} required placeholder="Email" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" className="btn-outline" onClick={() => setStep('seats')}>← Back</button>
                      <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Next: Summary →</button>
                    </div>
                  </form>
                </>
              )}

              {/* ── Step 3: Final Summary ─── */}
              {step === 'summary' && (
                <>
                  <h4>Step 3 — Booking Summary</h4>
                  <div className="final-summary">
                    <table className="summary-table">
                      <tbody>
                        <tr><td>Bus Name</td><td><strong>{bus.bus_name}</strong></td></tr>
                        <tr><td>Reg Number</td><td>{bus.reg_number}</td></tr>
                        <tr><td>Route</td><td>{bus.from_location} → {bus.to_location}</td></tr>
                        <tr><td>Departure</td><td>{bus.departure_time}</td></tr>
                        <tr><td>Travel Date</td><td><strong>{search.date}</strong></td></tr>
                        <tr><td>Seats Selected</td><td><strong>{selectedSeats.join(', ')}</strong></td></tr>
                        <tr><td>No. of Seats</td><td>{selectedSeats.length}</td></tr>
                        <tr><td>Passenger</td><td>{details.customer_name}</td></tr>
                        <tr><td>Phone</td><td>{details.phone}</td></tr>
                        <tr><td>Age / Gender</td><td>{details.age} / {details.gender}</td></tr>
                        <tr><td>Email</td><td>{details.email}</td></tr>
                        <tr><td>Price per Seat</td><td>₹ {(parseFloat(bus.price) || 0).toLocaleString('en-IN')}</td></tr>
                        <tr className="total-row"><td>TOTAL AMOUNT</td><td><strong>₹ {totalPrice.toLocaleString('en-IN')}</strong></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="btn-outline" onClick={() => setStep('details')}>← Edit Details</button>
                    <button type="button" className="btn-success" onClick={confirmBooking} disabled={loading}>
                      {loading ? 'Booking...' : '✔ Confirm & Book'}
                    </button>
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default BookTicket;
