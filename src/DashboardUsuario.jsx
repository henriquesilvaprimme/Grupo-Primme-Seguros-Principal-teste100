import React from "react";
import Sidebar from "./Sidebar";

const DashboardUsuario = ({ tipoUsuario, leads, usuarioLogado }) => {
  // Filtra os leads atribuídos ao usuário logado
  const leadsDoUsuario = leads.filter(
    (lead) => lead.usuarioId === usuarioLogado?.id
  );

  return (
    <div className="flex">
      <Sidebar tipoUsuario={tipoUsuario} />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard do Usuário</h1>
        <p>Bem-vindo! Aqui você pode visualizar e gerenciar seus leads.</p>

        {/* Exibição do total de leads do usuário */}
        <div className="mt-6 bg-white shadow rounded-xl p-4 w-64">
          <h2 className="text-lg font-semibold">Total de Leads</h2>
          <p className="text-3xl text-blue-600">{leadsDoUsuario.length}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsuario;
