import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ leads }) => {
  const [leadsClosed, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const buscarLeads = async () => {
    try {
      const response = await axios.get(
        '/api/gas?v=pegar_clientes_fechados'
      );
      setLeads(response.data);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarLeads();
  }, []);

  // Contadores existentes
  const totalLeads = leads.length;
  const leadsFechados = leads.filter((lead) => lead.status === 'Fechado').length;
  const leadsPerdidos = leads.filter((lead) => lead.status === 'Perdido').length;
  const leadsEmContato = leads.filter((lead) => lead.status === 'Em Contato').length;
  const leadsSemContato = leads.filter((lead) => lead.status === 'Sem Contato').length;

  // Contadores por seguradora baseados em leadsClosed
  const portoSeguro = leadsClosed.filter((lead) => lead.Seguradora === 'Porto Seguro').length;
  const azulSeguros = leadsClosed.filter((lead) => lead.Seguradora === 'Azul Seguros').length;
  const itauSeguros = leadsClosed.filter((lead) => lead.Seguradora === 'Itau Seguros').length;
  const demais = leadsClosed.filter((lead) => lead.Seguradora === 'Demais Seguradoras').length;

  // Calcular total de prêmio líquido global
  const totalPremioLiquido = leadsClosed.reduce(
    (acc, curr) => acc + (Number(curr.PremioLiquido) || 0),
    0
  );

  // Calcular média ponderada de comissão global
  const somaPonderadaComissao = leadsClosed.reduce((acc, lead) => {
    const premio = Number(lead.PremioLiquido) || 0;
    const comissao = Number(lead.Comissao) || 0;
    return acc + premio * (comissao / 100);
  }, 0);

  const comissaoMediaGlobal =
    totalPremioLiquido > 0 ? (somaPonderadaComissao / totalPremioLiquido) * 100 : 0;

  // Estilo comum para as caixas
  const boxStyle = {
    padding: '10px',
    borderRadius: '5px',
    flex: 1,
    color: '#fff',
    textAlign: 'center',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <div>
          <label>Data Início: </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div>
          <label>Data Fim: </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      {/* Primeira linha de contadores */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ ...boxStyle, backgroundColor: '#eee', color: '#333' }}>
          <h3>Total de Leads</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalLeads}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#4CAF50' }}>
          <h3>Leads Fechados</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsFechados}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#F44336' }}>
          <h3>Leads Perdidos</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsPerdidos}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#FF9800' }}>
          <h3>Em Contato</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsEmContato}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#9E9E9E' }}>
          <h3>Sem Contato</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{leadsSemContato}</p>
        </div>
      </div>

      {/* Segunda linha de contadores (por seguradora) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ ...boxStyle, backgroundColor: '#003366' }}>
          <h3>Porto Seguro</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{portoSeguro}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#87CEFA' }}>
          <h3>Azul Seguros</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{azulSeguros}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#FF8C00' }}>
          <h3>Itau Seguros</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{itauSeguros}</p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#4CAF50' }}>
          <h3>Demais Seguradoras</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{demais}</p>
        </div>
      </div>

      {/* Linha extra para Prêmio Líquido e Comissão */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ ...boxStyle, backgroundColor: '#3f51b5' }}>
          <h3>Total Prêmio Líquido</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {totalPremioLiquido.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
        <div style={{ ...boxStyle, backgroundColor: '#009688' }}>
          <h3>Média Comissão</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {comissaoMediaGlobal.toFixed(2).replace('.', ',')}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
