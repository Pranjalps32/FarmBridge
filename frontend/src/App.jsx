import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getStyles } from './Styles';
import CustomerDashboard from './views/CustomerDashboard';
import FarmerDashboard from './views/FarmerDashboard';

const API = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null); 
  const [products, setProducts] = useState([]); 
  const [view, setView] = useState('login'); 
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'customer' });
  const s = getStyles();

  const fetchAll = async () => {
    try { const res = await axios.get(`${API}/products`); setProducts(res.data || []); } 
    catch (e) { console.error("DB Error"); }
  };

  useEffect(() => { fetchAll(); }, []);

  // 🚪 NEW: LOGOUT FUNCTION
  const handleLogout = () => {
    setUser(null); // Clears the logged-in user
    setView('login'); // Returns to login view
    setForm({ email: '', password: '', name: '', role: 'customer' }); // Resets form
  };

  const handleAuth = async () => {
    try {
      const payload = view === 'login' ? { email: form.email, password: form.password } : form;
      const res = await axios.post(`${API}/${view}`, payload);
      if (view === 'login') setUser(res.data.user);
      else { alert("Registration Success!"); setView('login'); }
    } catch (e) { alert("Auth failed: " + (e.response?.data || "Error")); }
  };

  if (!user) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1B3022' }}>
      <div style={{ ...s.card, width: '400px' }}>
        <h1 style={{ textAlign: 'center', color: '#4CAF50' }}>FarmBridge 🌿</h1>
        {view === 'register' && <input style={s.input} placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} />}
        <input style={s.input} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input style={s.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        {view === 'register' && (
          <select style={s.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="customer">I am a Buyer</option>
            <option value="farmer">I am a Farmer</option>
          </select>
        )}
        <button style={{ ...s.btnPrimary, width: '100%', marginTop: '10px' }} onClick={handleAuth}>{view === 'login' ? 'Sign In' : 'Create Account'}</button>
        <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', color: '#4CAF50', marginTop: '15px' }}>{view === 'login' ? "Register Now" : "Back to Login"}</p>
      </div>
    </div>
  );

  // 🚦 PASSING onLogout Prop to Dashboards
  return user.role === 'farmer' ? 
    <FarmerDashboard user={user} API={API} products={products} fetchAll={fetchAll} onLogout={handleLogout} /> : 
    <CustomerDashboard user={user} API={API} products={products} fetchAll={fetchAll} onLogout={handleLogout} />;
}
export default App;