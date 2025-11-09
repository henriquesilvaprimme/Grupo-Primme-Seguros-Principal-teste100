import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ leads }) => {
  // Estado para armazenar os leads da aba "Leads Fechados" já filtrados pelo GAS
  const [leadsFechadosComSeguradora, setLeadsFechadosComSeguradora] = useState([]);
  const [loadingFechados, setLoadingFechados] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Função para buscar APENAS os leads da aba 'Leads Fechados'
  // Agora, esperamos que o GAS já tenha feito a maior parte do filtro.
  const buscarLeadsFechadosDoSheets = async () => {
    try {
      const response = await axios.get(
        '/api/gas?v=pegar_clientes_fechados'
      );

      // Opcional: Adicionar um filtro no frontend como "segurança extra"
      // Se o GAS estiver fazendo o trabalho perfeito, este filtro pode ser mais simples ou removido.
      // Mantive a versão robusta para caso haja inconsistências nos dados.
      const filteredLeads = response.data.filter(
        (lead) => lead.Status === 'Fechado' && lead.Seguradora && String(lead.Seguradora).trim() !== ''
      );

      setLeadsFechadosComSeguradora(filteredLeads);
    } catch (error) {
      console.error('Erro ao buscar leads fechados específicos:', error);
    } finally {
      setLoadingFechados(false);
    }
  };

  useEffect(() => {
    buscarLeadsFechadosDoSheets();
  }, []);

  // --- CONTADORES ---
  // Estes contadores continuam usando a prop 'leads' (da aba geral 'Leads')
  const totalLeads = leads.length;
  const leadsPerdidos = leads.filter((lead) => lead.status === 'Perdido').length;
  const leadsEmContato = leads.filter((lead) => lead.status === 'Em Contato').length;
  const leadsSemContato = leads.filter((lead) => lead.status === 'Sem Contato').length;

  // ESTE É O CONTADOR QUE VOCÊ QUERIA FOCAR:
  // Usa o estado 'leadsFechadosComSeguradora' que vem da aba 'Leads Fechados'
  const leadsFechados = leadsFechadosComSeguradora.length;

  // Contadores por seguradora baseados em 'leadsFechadosComSeguradora' (correto)
  const portoSeguro = leadsFechadosComSeguradora.filter((lead) => lead.Seguradora === 'Porto Seguro').length;
  const azulSeguros = leadsFechadosComSeguradora.filter((lead) => lead.Seguradora === 'Azul Seguros').length;
  const itauSeguros = leadsFechadosComSeguradora.filter((lead) => lead.Seguradora === 'Itau Seguros').length;
  const demais = leadsFechadosComSeguradora.filter((lead) => lead.Seguradora === 'Demais Seguradoras').length;

  // Calcular total de prêmio líquido global (também baseado em 'leadsFechadosComSeguradora')
  const totalPremioLiquido = leadsFechadosComSeguradora.reduce(
    (acc, curr) => acc + (Number(curr.PremioLiquido) || 0),
    0
  );

  // Calcular média ponderada de comissão global (também baseado em 'leadsFechadosComSeguradora')
  const somaPonderadaComissao = leadsFechadosComSeguradora.reduce((acc, lead) => {
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

  if (loadingFechados) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando dados de leads fechados...</div>;
  }

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
