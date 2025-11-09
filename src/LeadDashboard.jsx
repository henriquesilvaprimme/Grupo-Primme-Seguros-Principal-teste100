import React, { useState } from 'react';
import Leads from './Leads';

const LeadDashboard = ({ user }) => {
  const [filter, setFilter] = useState('todos');

  // Lista de leads simulada
  const leads = [
    { id: 1, nome: 'João Silva', email: 'joao@email.com' },
    { id: 2, nome: 'Maria Souza', email: 'maria@email.com' },
    { id: 3, nome: 'Carlos Lima', email: 'carlos@email.com' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Menu lateral */}
      <nav className="bg-gray-800 text-white w-64 p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <button
          onClick={() => setFilter('todos')}
          className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('fechado')}
          className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
        >
          Fechados
        </button>
        <button
          onClick={() => setFilter('perdido')}
          className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded"
        >
          Perdidos
        </button>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Painel de Leads</h1>
        <p className="text-gray-700 mb-6">Usuário logado: {user}</p>

        <Leads leads={leads} filter={filter} />
      </main>
    </div>
  );
};

export default LeadDashboard;
