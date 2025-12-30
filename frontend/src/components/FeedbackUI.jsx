import React from 'react';
import { THEME } from '../Styles';

// A smooth spinner to show while data is fetching
export const LoadingSpinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
    <div className="spinner"></div>
    <p style={{ marginTop: '20px', color: '#666' }}>Fetching fresh harvest data...</p>
    <style>{`
      .spinner {
        border: 4px solid rgba(0,0,0,0.1);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border-left-color: ${THEME.light.primary};
        animation: spin 1s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// An error screen to show if the database connection fails
export const ErrorScreen = ({ message, retry }) => (
  <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '20px', margin: '40px' }}>
    <h1 style={{ fontSize: '50px', margin: 0 }}>📡</h1>
    <h2 style={{ color: '#d32f2f' }}>Connection Interrupted</h2>
    <p style={{ color: '#666' }}>{message || "We couldn't reach the FarmBridge servers."}</p>
    <button 
      onClick={retry} 
      style={{ background: THEME.light.primary, color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' }}
    >
      Retry Connection
    </button>
  </div>
);