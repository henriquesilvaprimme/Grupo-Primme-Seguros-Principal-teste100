import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCcw } from 'lucide-react'; // Adicionado RefreshCcw para o ícone de refresh

// Certifique-se de que esta URL é a da SUA ÚLTIMA IMPLANTAÇÃO do Apps Script.
// Ela deve ser a mesma URL base usada para as requisições POST/GET.
const GOOGLE_SHEETS_BASE_URL = '/api/gas'; // <-- ATUALIZE ESTA LINHA COM A URL REAL DA SUA IMPLANTAÇÃO

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [senhaVisivel, setSenhaVisivel] = useState({}); 
  const [isRefreshing, setIsRefreshing] = useState(false); 

  // Função para buscar usuários do Google Sheets
  const fetchUsuariosFromSheet = async () => {
    setError(null);
    try {
      const response = await fetch(`${GOOGLE_SHEETS_BASE_URL}?v=pegar_usuario`;
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const formattedUsuarios = data.map((item) => ({
          id: item.id || '',
          usuario: item.usuario || '',
          nome: item.nome || '',
          email: item.email || '',
          senha: item.senha || '',
          status: item.status || 'Ativo',
          tipo: item.tipo || 'Usuario',
        }));
        setUsuarios(formattedUsuarios);
      } else {
        console.warn('Dados recebidos não são um array:', data);
        setUsuarios([]);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários do Google Sheets:', err);
      setError('Erro ao carregar usuários. Tente novamente mais tarde.');
      setUsuarios([]);
    } finally {
      setLoading(false); 
      setIsRefreshing(false); 
    }
  };

  // Função para lidar com o refresh e ativar/desativar o loader
  const handleRefresh = async () => {
    setIsRefreshing(true); 
    await fetchUsuariosFromSheet();
  };

  // useEffect para buscar usuários na montagem e configurar o intervalo de atualização
  useEffect(() => {
    setLoading(true); 
    fetchUsuariosFromSheet(); 

    const interval = setInterval(() => {
      console.log('Atualizando lista de usuários automaticamente...');
      fetchUsuariosFromSheet();
    }, 60000); 

    return () => clearInterval(interval);
  }, []); 

  // Função para atualizar status ou tipo de usuário no Google Sheets
  const atualizarStatusUsuario = async (id, novoStatus = null, novoTipo = null) => {
    const usuarioParaAtualizar = usuarios.find((u) => String(u.id) === String(id));
    if (!usuarioParaAtualizar) {
      console.warn(`Usuário com ID ${id} não encontrado localmente para atualização.`);
      return;
    }

    const usuarioParaEnviar = { ...usuarioParaAtualizar };

    if (novoStatus !== null) usuarioParaEnviar.status = novoStatus;
    if (novoTipo !== null) usuarioParaEnviar.tipo = novoTipo;

    try {
      console.log('Enviando solicitação de atualização para Apps Script:', usuarioParaEnviar);
      
      await fetch(`${GOOGLE_SHEETS_BASE_URL}?v=alterar_usuario`, {
        method: 'POST',
        body: JSON.stringify({ usuario: usuarioParaEnviar }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Solicitação de atualização para o usuário enviada ao Apps Script (modo no-cors).');
      console.log('Por favor, verifique os logs de execução do Google Apps Script para confirmação de sucesso e possíveis erros.');

      // Otimisticamente, atualiza o estado local para que a UI responda imediatamente
      setUsuarios((prev) =>
        prev.map((u) =>
          String(u.id) === String(id)
            ? {
                ...u,
                ...(novoStatus !== null ? { status: novoStatus } : {}),
                ...(novoTipo !== null ? { tipo: novoTipo } : {}),
              }
            : u
        )
      );

    } catch (err) {
      console.error('Erro ao enviar atualização de usuário para o Apps Script:', err);
      alert('Erro ao atualizar usuário. Por favor, tente novamente.');
    }
  };

  const handleToggleStatus = (id, statusAtual) => {
    const novoStatus = statusAtual === 'Ativo' ? 'Inativo' : 'Ativo';
    atualizarStatusUsuario(id, novoStatus);
  };

  const handleToggleTipo = (id, tipoAtual) => {
    const novoTipo = tipoAtual === 'Admin' ? 'Usuario' : 'Admin'; 
    atualizarStatusUsuario(id, null, novoTipo);
  };

  const toggleVisibilidadeSenha = (id) => {
    setSenhaVisivel((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-lg text-gray-700">Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 font-medium text-lg">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">Gerenciar Usuários</h2>
        <button
          title="Clique para atualizar os dados"
          onClick={handleRefresh}
          className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all duration-200 ease-in-out flex items-center justify-center shadow-sm"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <RefreshCcw size={20} />
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-indigo-100">
            <tr>
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Nome</th>
              <th className="py-3 px-6 text-left">Usuário</th>
              <th className="py-3 px-6 text-left">E-mail</th>
              <th className="py-3 px-6 text-left">Senha</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Tipo</th>
              <th className="py-3 px-6 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50 transition"> {/* Exatamente como seu código */}
                  <td className="py-3 px-6">{usuario.id}</td>
                  <td className="py-3 px-6">{usuario.nome}</td>
                  <td className="py-3 px-6">{usuario.usuario}</td>
                  <td className="py-3 px-6">{usuario.email}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <input
                        type={senhaVisivel[usuario.id] ? 'text' : 'password'}
                        value={usuario.senha}
                        readOnly
                        className="border rounded px-2 py-1 w-32 text-sm" {/* Exatamente como seu código */}
                      />
                      <button
                        onClick={() => toggleVisibilidadeSenha(usuario.id)}
                        className="text-gray-500 hover:text-gray-700" {/* Exatamente como seu código */}
                      >
                        {senhaVisivel[usuario.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        usuario.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {usuario.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        usuario.tipo === 'Admin' ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      {usuario.tipo === 'Admin' ? 'Admin' : 'Usuário Comum'}
                    </span>
                  </td>
                  <td className="py-3 px-6 flex gap-4 items-center">
                    <button
                      onClick={() => handleToggleStatus(usuario.id, usuario.status)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        usuario.status === 'Ativo'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      } transition`} {/* Exatamente como seu código, com 'transition' */}
                    >
                      {usuario.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                    <label className="flex items-center gap-1 text-sm"> {/* Exatamente como seu código */}
                      <input
                        type="checkbox"
                        checked={usuario.tipo === 'Admin'}
                        onChange={() => handleToggleTipo(usuario.id, usuario.tipo)}
                        className="form-checkbox h-4 w-4 text-blue-600" {/* Exatamente como seu código */}
                      />
                      Admin
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-600 text-lg">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GerenciarUsuarios;
