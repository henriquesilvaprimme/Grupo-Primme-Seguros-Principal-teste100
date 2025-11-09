// src/components/LeadsNaoAtribuidos.jsx
import React, { useEffect, useState } from 'react';
import { buscarLeadsNaoAtribuidos } from '../services/leadService';

export default function LeadsNaoAtribuidos() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarLeads() {
      const dados = await buscarLeadsNaoAtribuidos();
      setLeads(dados);
      setLoading(false);
    }
    carregarLeads();
  }, []);

  if (loading) return <p>Carregando leads não atribuídos...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Leads Não Atribuídos</h1>
      {leads.length === 0 ? (
        <p>Nenhum lead não atribuído encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {leads.map(({ id, data }) => (
            <li key={id} className="border rounded p-4 shadow">
              <p><strong>ID:</strong> {id}</p>
              <p><strong>Nome:</strong> {data[1]}</p>
              <p><strong>Veículo:</strong> {data[2]} {data[3]}</p>
              <p><strong>Telefone:</strong> {data[5]}</p>
              <p><strong>Status:</strong> {data[9] || 'Não definido'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
