import React from 'react';
import Dashboard from './Dashboard';
import Leads from './Leads';

const AuthenticatedApp = ({ usuario, onLogout }) => {
  // aqui você pode ter estado para trocar entre Dashboard e Leads
  const [abaAtiva, setAbaAtiva] = React.useState('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Menu lateral */}
      <nav style={{
        width: '200px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>{usuario}</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '15px', cursor: 'pointer', fontWeight: abaAtiva === 'dashboard' ? 'bold' : 'normal' }}
                onClick={() => setAbaAtiva('dashboard')}>
              Dashboard
            </li>
            <li style={{ marginBottom: '15px', cursor: 'pointer', fontWeight: abaAtiva === 'leads' ? 'bold' : 'normal' }}
                onClick={() => setAbaAtiva('leads')}>
              Leads
            </li>
          </ul>
        </div>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </nav>

      {/* Conteúdo principal */}
      <main style={{ flex: 1, padding: '30px', backgroundColor: '#e9ecef' }}>
        {abaAtiva === 'dashboard' && <Dashboard />}
        {abaAtiva === 'leads' && <Leads />}
      </main>
    </div>
  );
};

export default AuthenticatedApp;
