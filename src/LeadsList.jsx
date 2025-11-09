import React from "react";

const statusColors = {
  "Fechado": "bg-green-100",
  "Perdido": "bg-red-100",
  "Em Contato": "bg-orange-100",
  "Sem Contato": "bg-white",
  "": "bg-white"
};

const LeadsList = ({ leads, onStatusChange }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lista de Leads</h2>
      {leads.map((lead, index) => (
        <div
          key={index}
          className={`p-4 mb-2 rounded shadow ${statusColors[lead.status || ""]}`}
        >
          <p><strong>Nome:</strong> {lead.nome}</p>
          <p><strong>Email:</strong> {lead.email}</p>
          <p><strong>Telefone:</strong> {lead.telefone}</p>
          <p><strong>Status:</strong></p>
          <select
            value={lead.status || ""}
            onChange={(e) => onStatusChange(index, e.target.value)}
            className="mt-1 p-2 border rounded"
          >
            <option value="">Selecione</option>
            <option value="Em Contato">Em Contato</option>
            <option value="Fechado">Fechado</option>
            <option value="Perdido">Perdido</option>
            <option value="Sem Contato">Sem Contato</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default LeadsList;
