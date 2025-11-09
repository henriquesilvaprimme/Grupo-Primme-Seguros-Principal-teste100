// DashboardUsuario.jsx
import React from 'react';

const DashboardUsuario = ({ leads }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Meu Painel</h2>
      <p>Você tem acesso limitado. Aqui estão os seus leads:</p>
      <ul className="mt-4">
        {leads.map((lead) => (
          <li key={lead.id} className="border-b py-2">
            {lead.name} - {lead.vehicleModel} - {lead.phone}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardUsuario;
