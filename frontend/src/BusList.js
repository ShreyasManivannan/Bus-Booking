import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BusList() {
  const [buses, setBuses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    bus_name: '', reg_number: '', from_location: '',
    to_location: '', departure_time: '', total_seats: 40, price: ''
  });

  useEffect(() => { fetchBuses(); }, []);

  async function fetchBuses() {
    try {
      const res = await axios.get('http://localhost:5000/api/buses');
      setBuses(res.data);
    } catch (e) { setError('Failed to load buses'); }
  }

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addBus(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await axios.post('http://localhost:5000/api/buses', form);
      setMsg('Bus added successfully!');
      setForm({ bus_name: '', reg_number: '', from_location: '', to_location: '', departure_time: '', total_seats: 40, price: '' });
      setShowForm(false);
      fetchBuses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bus');
    }
  }

  async function deleteBus(id) {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/buses/${id}`);
      fetchBuses();
    } catch (e) { alert('Failed to delete'); }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Buses</h2>
        <button className="btn-primary" style={{ width: 'auto' }}
          onClick={() => { setShowForm(!showForm); setMsg(''); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Bus'}
        </button>
      </div>

      {error && <p className="msg error">{error}</p>}
      {msg   && <p className="msg success">{msg}</p>}

      {showForm && (
        <div className="form-card">
          <h3>Add New Bus</h3>
          <form onSubmit={addBus}>
            <div className="form-row">
              <div className="field">
                <label>Bus Name</label>
                <input name="bus_name" value={form.bus_name} onChange={handle} required placeholder="e.g. Karnataka Express" />
              </div>
              <div className="field">
                <label>Reg Number</label>
                <input name="reg_number" value={form.reg_number} onChange={handle} required placeholder="e.g. KA-01-1234" />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>From</label>
                <input name="from_location" value={form.from_location} onChange={handle} required placeholder="e.g. Bangalore" />
              </div>
              <div className="field">
                <label>To</label>
                <input name="to_location" value={form.to_location} onChange={handle} required placeholder="e.g. Mysore" />
              </div>
            </div>
            <div className="form-row-3">
              <div className="field">
                <label>Departure Time</label>
                <input name="departure_time" value={form.departure_time} onChange={handle} required placeholder="e.g. 08:00 AM" />
              </div>
              <div className="field">
                <label>Total Seats</label>
                <input type="number" name="total_seats" value={form.total_seats} onChange={handle} min="1" max="60" />
              </div>
              <div className="field">
                <label>Price per Seat (₹)</label>
                <input type="number" name="price" value={form.price} onChange={handle} required min="0" placeholder="e.g. 350" />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Add Bus</button>
          </form>
        </div>
      )}

      {buses.length === 0 ? (
        <p className="empty">No buses added yet. Click "+ Add Bus" to add one.</p>
      ) : (
        <div className="bus-grid">
          {buses.map(bus => (
            <div className="bus-card" key={bus.id}>
              <div className="bus-card-header">
                <h3>{bus.bus_name}</h3>
                <span className="reg">{bus.reg_number}</span>
              </div>
              <p className="route">{bus.from_location} → {bus.to_location}</p>
              <div className="bus-info">
                <span>🕐 {bus.departure_time}</span>
                <span>💺 {bus.total_seats} seats</span>
              </div>
              <div className="price-tag">₹ {(parseFloat(bus.price) || 0).toLocaleString('en-IN')} per seat</div>
              <button className="btn-danger" onClick={() => deleteBus(bus.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BusList;
