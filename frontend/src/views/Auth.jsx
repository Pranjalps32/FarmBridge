import React, { useState } from 'react';
import axios from 'axios';
import { s, THEME } from '../Styles';

const Auth = ({ setView, setUser, API }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', role: 'customer', name: '' });

  const submit = async () => {
    try {
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const res = await axios.post(`${API}/${mode}`, payload);
      if (mode === 'login') { setUser(res.data.user); setView('market'); }
      else { alert("Success! Please Login."); setMode('login'); }
    } catch (e) { alert("Error: Check Credentials"); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
      <div style={{ ...s.card, width: '350px', textAlign: 'center' }}>
        <h2 style={{color: THEME.primary}}>{mode.toUpperCase()}</h2>
        {mode === 'register' && <input style={s.input} placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} />}
        <input style={s.input} placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
        <input style={s.input} type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
        {mode === 'register' && (
          <select style={s.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="customer">Buyer</option><option value="farmer">Farmer</option>
          </select>
        )}
        <button style={s.mainBtn} onClick={submit}>Go</button>
        <p style={{marginTop: '15px', cursor: 'pointer', fontSize: '13px'}} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>Switch to {mode === 'login' ? 'Register' : 'Login'}</p>
      </div>
    </div>
  );
};
export default Auth;