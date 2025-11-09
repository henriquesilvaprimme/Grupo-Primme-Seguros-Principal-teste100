import React from 'react';
import { useNavigate } from 'react-router-dom';

const LeadCard = ({ lead, destaque = false }) => {
  const navigate = useNavigate();
  const corFundo = destaque ? '#f0f8ff' : '#ffffff'; // azul claro se destaque

  const handleAbrir = () => {
    const status = lead.status?.toLowerCase();

    if (status === 'perdido') {
      navigate(`/leads-perdidos?highlight=${lead.id}`);
    } else if (status === 'fechado' || lead.insurerConfirmed === true) {
      navigate(`/leads-fechados?highlight=${lead.id}`);
    } else {
      navigate(`/leads?highlight=${lead.id}`);
    }
  };

  return (
    <div
      id={`lead-card-${lead.id}`}
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: corFundo,
        maxWidth: '500px',
        marginBottom: '12px'
      }}
    >
      <h3>{lead.name}</h3>
      <p><strong>Modelo do veículo:</strong> {lead.vehicleModel}</p>
      <p><strong>Ano/Modelo:</strong> {lead.vehicleYearModel}</p>
      <p><strong>Cidade:</strong> {lead.city}</p>
      <p><strong>Telefone:</strong> {lead.phone}</p>
      <p><strong>Tipo de Seguro:</strong> {lead.insuranceType}</p>
      <p><strong>Status:</strong> {lead.status}</p>

      <button
        onClick={handleAbrir}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Abrir
      </button>
    </div>
  );
};

export default LeadCard;
