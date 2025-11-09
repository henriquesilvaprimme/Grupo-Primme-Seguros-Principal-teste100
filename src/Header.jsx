// Header.jsx
import React from 'react';

const Header = ({ user }) => {
  const formatName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(Boolean).slice(0, 2);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  };

  return (
    <header style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold' }}>
      Olá, {formatName(user)}
    </header>
  );
};

export default Header;
