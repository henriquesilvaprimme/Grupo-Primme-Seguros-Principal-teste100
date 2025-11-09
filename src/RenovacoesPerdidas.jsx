import React, { useState } from 'react';

const LeadsPerdidos = ({ leads, usuarios, fetchLeadsFromSheet, isAdmin }) => {

  const perdidos = leads.filter(lead => lead.status === 'Perdido');

  const [nomeInput, setNomeInput] = useState('');
  const [dataInput, setDataInput] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroData, setFiltroData] = useState('');

  // Função para normalizar texto (remover acentos e caracteres especiais)
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,]/g, '')
      .trim();
  };

  const aplicarFiltroNome = () => {
    setFiltroNome(nomeInput.trim());
  };

  const aplicarFiltroData = () => {
    setFiltroData(dataInput);
  };

  const leadsFiltrados = perdidos.filter((lead) => {
    if (filtroNome) {
      const nomeNormalizado = normalizarTexto(lead.name);
      const filtroNormalizado = normalizarTexto(filtroNome);
      if (!nomeNormalizado.includes(filtroNormalizado)) {
        return false;
      }
    }

    if (filtroData) {
      const dataLead = new Date(lead.createdAt).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }); // "2025-06-08"
      if (dataLead !== filtroData) {
        return false;
      }
    }
    return true;
  });

  console.log("leadsFiltrados ", leadsFiltrados)

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0 }}>Leads Perdidos</h1>

          <button title='Clique para atualizar os dados'
            onClick={() => {
              fetchLeadsFromSheet();
            }}
          >
            🔄
          </button>
      </div>

      {/* Container filtros: nome centralizado, data canto direito */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {/* Filtro nome: centralizado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: '1',
            justifyContent: 'center',
            minWidth: '280px',
          }}
        >
          <button
            onClick={aplicarFiltroNome}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginRight: '8px',
            }}
          >
            Filtrar
          </button>
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={nomeInput}
            onChange={(e) => setNomeInput(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '220px',
              maxWidth: '100%',
            }}
            title="Filtrar leads pelo nome (contém)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicarFiltroNome();
            }}
          />
        </div>

        {/* Filtro data: canto direito */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '230px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={aplicarFiltroData}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginRight: '8px',
            }}
          >
            Filtrar
          </button>
          <input
            type="date"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              minWidth: '140px',
            }}
            title="Filtrar leads pela data exata de criação"
            onKeyDown={(e) => {
              if (e.key === 'Enter') aplicarFiltroData();
            }}
          />
        </div>
      </div>

      {leadsFiltrados.length === 0 ? (
        <p>Não há leads perdidos que correspondam ao filtro aplicado.</p>
      ) : (
        leadsFiltrados.map(lead => {
          const containerStyle = {
            border: '2px solid #F44336',
            backgroundColor: '#fcebea',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '5px'
          };

          const responsavel = usuarios.find((u) => u.nome === lead.responsavel && isAdmin);

          return (
            <div key={lead.id} style={containerStyle}>
              <h3>{lead.name}</h3>
              <p><strong>Modelo:</strong> {lead.vehicleModel}</p>
              <p><strong>Ano/Modelo:</strong> {lead.vehicleYearModel}</p>
              <p><strong>Cidade:</strong> {lead.city}</p>
              <p><strong>Telefone:</strong> {lead.phone}</p>
              <p><strong>Tipo de Seguro:</strong> {lead.insuranceType}</p>

              {responsavel && (
                <p style={{ marginTop: '10px', color: '#007bff' }}>
                  Transferido para <strong>{responsavel.nome}</strong>
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default LeadsPerdidos;
