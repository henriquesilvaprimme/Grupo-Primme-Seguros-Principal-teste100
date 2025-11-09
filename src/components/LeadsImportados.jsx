import React, { useState, useEffect } from 'react';
import Lead from './components/Lead';

const GOOGLE_SHEETS_SCRIPT_URL = '/api/gas?v=getLeads';

const Leads = ({ leads, usuarios, onUpdateStatus, transferirLead, usuarioLogado }) => {
  const [selecionados, setSelecionados] = useState({}); // { [leadId]: userId }
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [leadsState, setLeadsState] = useState(leads || []);

  // Estados para filtro por data
  const [dataInput, setDataInput] = useState('');
  const [filtroData, setFiltroData] = useState('');

  // Estados para filtro por nome
  const [nomeInput, setNomeInput] = useState('');
  const [filtroNome, setFiltroNome] = useState('');

  // Buscar leads atualizados do Google Sheets
  const buscarLeadsAtualizados = async () => {
    try {
      const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL);
      if (response.ok) {
        const dadosLeads = await response.json();
        setLeadsState(dadosLeads);
      } else {
        console.error('Erro ao buscar leads:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    }
  };

  useEffect(() => {
    buscarLeadsAtualizados();
    const intervalo = setInterval(buscarLeadsAtualizados, 60000);
    return () => clearInterval(intervalo);
  }, []);

  // Sincronizar leads recebidos via props com estado local (se props leads mudarem)
  useEffect(() => {
    setLeadsState(leads);
  }, [leads]);

  const leadsPorPagina = 10;

  // Função para normalizar strings (remover acento, pontuação, espaços, etc)
  const normalizarTexto = (texto = '') => {
    return texto
      .toLowerCase()
      .normalize('NFD') // separa os acentos
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '') // remove pontuação
      .replace(/\s+/g, ' ') // substitui múltiplos espaços por um espaço
      .trim();
  };

  const aplicarFiltroData = () => {
    setFiltroData(dataInput);
    setFiltroNome('');
    setNomeInput('');
    setPaginaAtual(1);
  };

  const aplicarFiltroNome = () => {
    const filtroLimpo = nomeInput.trim();
    setFiltroNome(filtroLimpo);
    setFiltroData('');
    setDataInput('');
    setPaginaAtual(1);
  };

  const isSameDate = (leadDateStr, filtroStr) => {
    if (!filtroStr) return true;
    const leadDate = leadDateStr?.slice(0, 10);
    const filtroDate = filtroStr;
    return leadDate === filtroDate;
  };

  const nomeContemFiltro = (leadNome, filtroNome) => {
    if (!filtroNome) return true;
    if (!leadNome) return false;

    const nomeNormalizado = normalizarTexto(leadNome);
    const filtroNormalizado = normalizarTexto(filtroNome);

    return nomeNormalizado.includes(filtroNormalizado);
  };

  // Filtragem dos leads pendentes + filtro data ou nome
  const gerais = leadsState.filter((lead) => {
    if (lead.status === 'Fechado' || lead.status === 'Perdido') return false;

    if (filtroData) {
      return isSameDate(lead.createdAt, filtroData);
    }

    if (filtroNome) {
      // Usando lead.name aqui
      return nomeContemFiltro(lead.name, filtroNome);
    }

    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(gerais.length / leadsPorPagina));
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas);

  const usuariosAtivos = usuarios.filter((u) => u.status === 'Ativo');
  const isAdmin = usuarioLogado?.id === 1;

  const handleSelect = (leadId, userId) => {
    setSelecionados((prev) => ({
      ...prev,
      [leadId]: Number(userId),
    }));
  };

  const handleEnviar = (leadId) => {
    const userId = selecionados[leadId];
    if (!userId) {
      alert('Selecione um usuário antes de enviar.');
      return;
    }
    transferirLead(leadId, userId);
  };

  const handleAlterar = (leadId) => {
    setSelecionados((prev) => ({
      ...prev,
      [leadId]: '',
    }));
    transferirLead(leadId, null);
  };

  const inicio = (paginaCorrigida - 1) * leadsPorPagina;
  const fim = inicio + leadsPorPagina;
  const leadsPagina = gerais.slice(inicio, fim);

  const handlePaginaAnterior = () => {
    setPaginaAtual((prev) => Math.max(prev - 1, 1));
  };

  const handlePaginaProxima = () => {
    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas));
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Linha de filtros */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <h1 style={{ margin: 0 }}>Leads</h1>

        {/* Filtro nome - centralizado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexGrow: 1,
            justifyContent: 'center',
            minWidth: '300px',
          }}
        >
          <button
            onClick={aplicarFiltroNome}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Filtrar
          </button>
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={nomeInput}
            onChange={(e) => setNomeInput(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '220px',
              maxWidth: '100%',
            }}
            title="Filtrar leads pelo nome (contém)"
          />
        </div>

        {/* Filtro data - direita */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '220px',
          }}
        >
          <button
            onClick={aplicarFiltroData}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            Filtrar
          </button>
          <input
            type="date"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
            title="Filtrar leads pela data exata de criação"
          />
        </div>
      </div>

      {gerais.length === 0 ? (
        <p>Não há leads pendentes.</p>
      ) : (
        <>
          {leadsPagina.map((lead) => {
            const responsavel = usuarios.find((u) => u.id === lead.usuarioId);

            return (
              <div
                key={lead.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  position: 'relative',
                }}
              >
                <Lead
                  lead={lead}
                  onUpdateStatus={onUpdateStatus}
                  disabledConfirm={!lead.usuarioId}
                />

                {lead.usuarioId && responsavel ? (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ color: '#28a745' }}>
                      Transferido para <strong>{responsavel.nome}</strong>
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => handleAlterar(lead.id)}
                        style={{
                          marginTop: '5px',
                          padding: '5px 12px',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Alterar
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <select
                      value={selecionados[lead.id] || ''}
                      onChange={(e) => handleSelect(lead.id, e.target.value)}
                      style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="">Selecione usuário ativo</option>
                      {usuariosAtivos.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleEnviar(lead.id)}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Enviar
                    </button>
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '15px',
                    fontSize: '12px',
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                  title={`Data de criação: ${formatarData(lead.createdAt)}`}
                >
                  {formatarData(lead.createdAt)}
                </div>
              </div>
            );
          })}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px',
            }}
          >
            <button
              onClick={handlePaginaAnterior}
              disabled={paginaCorrigida === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: paginaCorrigida === 1 ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: paginaCorrigida === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Anterior
            </button>

            <span style={{ alignSelf: 'center' }}>
              Página {paginaCorrigida} de {totalPaginas}
            </span>

            <button
              onClick={handlePaginaProxima}
              disabled={paginaCorrigida === totalPaginas}
              style={{
                padding: '8px 16px',
                backgroundColor:
                  paginaCorrigida === totalPaginas ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor:
                  paginaCorrigida === totalPaginas ? 'not-allowed' : 'pointer',
              }}
            >
              Próximo
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Leads;
