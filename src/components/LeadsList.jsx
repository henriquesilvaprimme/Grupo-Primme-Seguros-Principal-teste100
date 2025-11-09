// src/components/LeadsList.js
import React, { useEffect, useState } from 'react';
import { getLeads } from '../api/getLeads';

function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await getLeads();
      setLeads(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <p>Carregando leads...</p>;

  return (
    <div>
      <h2>Leads Recebidos</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Cidade</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr key={idx}>
              <td>{lead.nome}</td>
              <td>{lead.telefone}</td>
              <td>{lead.cidade}</td>
              <td>{lead.status}</td>
              <td>{new Date(lead.data).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadsList;
