import React, { useEffect, useState } from 'react';

// URL do seu endpoint GAS — substitua pela URL do seu deployment
const GAS_ENDPOINT_URL = '/api/gas';

const LeadsNaoAtribuidos = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para buscar leads não atribuídos no GAS
  const fetchLeadsNaoAtribuidos = async () => {
    setLoading(true);
    setError('');
    try {
      // O GAS espera um POST com parâmetro 'acao=listarLeadsNaoAtribuidos'
      const params = new URLSearchParams();
      params.append('acao', 'listarLeadsNaoAtribuidos');

      const response = await fetch(GAS_ENDPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      if (json.status === 'ok') {
        setLeads(json.leads || []);
      } else {
        throw new Error(json.mensagem || 'Erro desconhecido na API');
      }
    } catch (err) {
      setError(err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Carrega leads ao montar componente
  useEffect(() => {
    fetchLeadsNaoAtribuidos();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Leads Não Atribuídos</h2>

      {loading && <p>Carregando leads...</p>}

      {error && (
        <p style={{ color: 'red' }}>
          Erro: {error}
        </p>
      )}

      {!loading && !error && leads.length === 0 && <p>Não há leads não atribuídos no momento.</p>}

      {!loading && !error && leads.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {leads.map(({ id, data }) => (
            <li key={id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
              <p><strong>ID:</strong> {id}</p>
              <p><strong>Nome:</strong> {data.name || '—'}</p>
              <p><strong>Telefone:</strong> {data.phone || '—'}</p>
              <p><strong>Cidade:</strong> {data.city || '—'}</p>
              {/* Pode expandir aqui com mais campos do seu lead */}
            </li>
          ))}
        </ul>
      )}

      <button onClick={fetchLeadsNaoAtribuidos} disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Atualizar Lista
      </button>
    </div>
  );
};

export default LeadsNaoAtribuidos;
