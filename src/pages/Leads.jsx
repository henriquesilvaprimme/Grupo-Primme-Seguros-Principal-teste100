import React, { useState } from 'react';

const Leads = ({ leads, usuarios, transferirLead }) => {
  const [selecionados, setSelecionados] = useState({}); // {leadId: userId}

  // Filtra só usuários ativos
  const usuariosAtivos = usuarios.filter(u => u.status === 'Ativo');

  const handleSelectUsuario = (leadId, userId) => {
    setSelecionados(prev => ({
      ...prev,
      [leadId]: userId
    }));
  };

  const handleTransferir = (leadId) => {
    const userId = selecionados[leadId];
    if (!userId) {
      alert('Selecione um usuário para transferir o lead.');
      return;
    }
    transferirLead(leadId, userId);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Leads</h2>
      {leads.length === 0 ? (
        <p>Nenhum lead cadastrado.</p>
      ) : (
        leads.map(lead => (
          <div key={lead.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 15, borderRadius: 8 }}>
            <p><strong>Nome:</strong> {lead.name}</p>
            <p><strong>Telefone:</strong> {lead.phone}</p>

            <div style={{ marginTop: 10 }}>
              <label htmlFor={`select-user-${lead.id}`}>Transferir para:</label>
              <select
                id={`select-user-${lead.id}`}
                value={selecionados[lead.id] || ''}
                onChange={(e) => handleSelectUsuario(lead.id, e.target.value)}
                style={{ marginLeft: 10, padding: 5 }}
              >
                <option value="">Selecione usuário</option>
                {usuariosAtivos.map(user => (
                  <option key={user.id} value={user.id}>{user.nome}</option>
                ))}
              </select>
              <button
                onClick={() => handleTransferir(lead.id)}
                style={{ marginLeft: 10, padding: '5px 10px', cursor: 'pointer' }}
              >
                Transferir
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Leads;
