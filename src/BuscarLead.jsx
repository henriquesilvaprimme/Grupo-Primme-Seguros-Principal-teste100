import React, { useState } from 'react';
import LeadCard from './components/LeadCard'; // ajuste o caminho se necessário

const BuscarLead = ({ leads, fetchLeadsFromSheet, fetchLeadsFechadosFromSheet  }) => {
  const [termo, setTermo] = useState('');
  const [erro, setErro] = useState('');
  const [leadEncontrado, setLeadEncontrado] = useState(null);

  const handleBuscar = () => {
    const termoNormalizado = termo.trim().toLowerCase();
    const termoNumerico = termo.replace(/\D/g, '');

    if (!termoNormalizado) {
      setErro('Digite um nome completo ou telefone.');
      setLeadEncontrado(null);
      return;
    }

    const leadsValidos = leads.filter((lead) => {
      const status = lead.status?.toLowerCase();
      return (
        status === 'selecione o status' ||
        status === 'selecionado' ||
        status === 'perdido' ||
        lead.insurerConfirmed === true
      );
    });

    const lead = leadsValidos.find((lead) => {
      const nome = lead.name?.trim().toLowerCase();
      const telefone = lead.phone?.replace(/\D/g, '');
      return nome === termoNormalizado || telefone === termoNumerico;
    });

    if (!lead) {
      setErro('Lead não encontrado nas abas principais.');
      setLeadEncontrado(null);
      return;
    }

    setErro('');
    setLeadEncontrado(lead);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0 }}>Buscar Lead</h1>

            <button title='Clique para atualizar os dados'
              onClick={() => {
                fetchLeadsFromSheet();
                fetchLeadsFechadosFromSheet();
                //fetchUsuariosFromSheet();
              }}
            >
              🔄
            </button>
        </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <input
          type="text"
          placeholder="Digite o nome completo ou telefone"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          style={{
            width: '30%',
            minWidth: '250px',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />

        <button
          onClick={handleBuscar}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            fontSize: '16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Buscar
        </button>

        {erro && (
          <div style={{ color: 'red' }}>{erro}</div>
        )}
      </div>

      {/* Exibe o card do lead abaixo da busca, se houver */}
      {leadEncontrado && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '10px' }}>Lead encontrado:</h3>
          <LeadCard lead={leadEncontrado} destaque />
        </div>
      )}
    </div>
  );
};

export default BuscarLead;
