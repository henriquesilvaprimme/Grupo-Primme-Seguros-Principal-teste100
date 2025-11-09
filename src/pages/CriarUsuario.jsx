import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CriarUsuario = ({ adicionarUsuario }) => {
  const [usuario, setUsuario] = useState(''); // Será usado como login
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState(''); // Nome completo
  const [senha, setSenha] = useState('');

  const navigate = useNavigate();

  const handleCriar = () => {
    if (!usuario || !email || !nome || !senha) {
      alert('Preencha todos os campos.');
      return;
    }

    const novoUsuario = {
      id: Date.now(),
      usuario, // Usado como login
      email,
      nome, // Nome completo
      senha,
      tipo: 'Usuario',
      status: 'Ativo',
    };

    criarUsuarioFunc(novoUsuario);

    adicionarUsuario(novoUsuario);
    
    navigate('/usuarios');
  };

  const criarUsuarioFunc = async (lead) => {

    try {
      const response = await fetch('/api/gas?v=criar_usuario', {
        method: 'POST',
        body: JSON.stringify(lead),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      //const result = await response.json();
      //console.log(result);
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
    }
  };

  




  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-3xl font-bold text-indigo-700 mb-4">Criar Novo Usuário</h2>

      <div>
        <label className="block text-gray-700">Usuário (Login)</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="block text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="block text-gray-700">Nome Completo</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="block text-gray-700">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCriar}
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
        >
          Criar Usuário
        </button>
      </div>
    </div>
  );
};

export default CriarUsuario;
