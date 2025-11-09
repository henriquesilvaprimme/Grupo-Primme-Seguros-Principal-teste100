import React, { useState, useEffect } from 'react';
// import { Phone } from 'lucide-react'; <-- REMOVIDO: Ícone de telefone para o botão do WhatsApp não é mais necessário

// AQUI: Adicionada a prop 'isAdmin'
const Lead = ({ lead, onUpdateStatus, disabledConfirm, isAdmin }) => {
  const [status, setStatus] = useState(lead.status || '');
  // `isStatusConfirmed` para controlar o bloqueio da seleção e exibição do botão "Alterar"
  const [isStatusConfirmed, setIsStatusConfirmed] = useState(
    // ATUALIZADO: Inclui 'Cancelado' na lista de status confirmados
    lead.status === 'Em Contato' || lead.status === 'Sem Contato' || lead.status === 'Fechado' || lead.status === 'Perdido' || lead.status.startsWith('Agendado') || lead.status === 'Cancelado'
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  // Define a cor do card conforme o status
  const cardColor = (() => {
    switch (true) {
      case status.startsWith('Fechado'):
        return '#d4edda'; // verde claro
      case status.startsWith('Perdido'):
        return '#f8d7da'; // vermelho claro
      case status.startsWith('Cancelado'): // NOVO STATUS: Usa 'Cancelado'
        return '#f8d7da'; // Usando a mesma cor vermelha de 'Perdido' para destaque
      case status.startsWith('Em Contato'):
        return '#fff3cd'; // laranja claro
      case status.startsWith('Sem Contato'):
        return '#e2e3e5'; // cinza claro
      case status.startsWith('Agendado'):
        return '#cce5ff'; // azul claro
      case status === 'Selecione o status' || status === '':
      default:
        return '#ffffff'; // branco
    }
  })();

  // Sincroniza o estado `isStatusConfirmed` quando o `lead.status` muda (ex: após um refresh de leads)
  useEffect(() => {
    setIsStatusConfirmed(
      // ATUALIZADO com 'Cancelado'
      lead.status === 'Em Contato' || lead.status === 'Sem Contato' || lead.status === 'Fechado' || lead.status === 'Perdido' || lead.status.startsWith('Agendado') || lead.status === 'Cancelado'
    );
    setStatus(lead.status || ''); // Garante que o status exibido esteja sempre atualizado com o lead
  }, [lead.status]);

  // Funções de atualização e confirmação

  const enviarLeadAtualizado = async (leadId, newStatus, phone) => {
    try {
      await fetch('/api/gas?v=alterar_status', {
        method: 'POST',
        body: JSON.stringify({
          lead: leadId,
          status: newStatus,
          phone: phone
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
    }
  };

  const handleConfirm = () => {
    if (!status || status === 'Selecione o status') {
      alert('Selecione um status antes de confirmar!');
      return;
    }

    enviarLeadAtualizado(lead.id, status, lead.phone);
    setIsStatusConfirmed(true);

    if (onUpdateStatus) {
      onUpdateStatus(lead.id, status, lead.phone); // chama o callback pra informar a atualização
    }
  };
  
  // NOVA FUNÇÃO: Botão Apólice Cancelada - AGORA ENVIA 'Cancelado'
  const handleCancelPolicy = () => {
    const newStatus = 'Cancelado'; // Status simplificado
    // Confirma se o usuário quer realmente cancelar
    if (window.confirm(`Tem certeza que deseja marcar a apólice do(a) ${lead.name} como CANCELADA?`)) {
      enviarLeadAtualizado(lead.id, newStatus, lead.phone);
      setStatus(newStatus);
      setIsStatusConfirmed(true);
      setShowCalendar(false);

      if (onUpdateStatus) {
        onUpdateStatus(lead.id, newStatus, lead.phone);
      }
    }
  };

  const handleScheduleConfirm = () => {
    if (!scheduledDate) {
      alert('Selecione uma data para o agendamento!');
      return;
    }

    // Cria um objeto de data a partir da string e ajusta para o fuso horário local
    const selectedDate = new Date(scheduledDate + 'T00:00:00'); // Adiciona T00:00:00 para garantir que a data seja interpretada como local
    
    // Formata a data para a string de status
    const formattedDate = selectedDate.toLocaleDateString('pt-BR');
    const newStatus = `Agendado - ${formattedDate}`;

    enviarLeadAtualizado(lead.id, newStatus, lead.phone);
    setStatus(newStatus);
    setIsStatusConfirmed(true);
    setShowCalendar(false);

    if (onUpdateStatus) {
      onUpdateStatus(lead.id, newStatus, lead.phone);
    }
  };

  const handleAlterar = () => {
    // Permite a edição do status novamente e esconde o calendário
    setIsStatusConfirmed(false);
    setShowCalendar(false);
  };

  
  // Função auxiliar para formatar datas (YYYY-MM-DD para DD/MM/YYYY)
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    // Assume YYYY-MM-DD
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
        return `${day}/${month}/${year}`;
    }
    return dateStr;
  };
  
  // Função auxiliar para formatar moeda
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return 'R$ 0,00';
    if (typeof value === 'string') {
        value = parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.'));
    }
    if (isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };


  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '5px',
        backgroundColor: cardColor,
        position: 'relative' // Essencial para posicionar o botão Cancelada
      }}
    >
      {/* NOVO BOTÃO: Apólice Cancelada - Posicionado no canto superior direito */}
      {isAdmin && !isStatusConfirmed && ( // AQUI: Adicionada a condição 'isAdmin'
        <div 
          style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '15px', 
            zIndex: 10 // Garante que fique por cima de outros elementos
          }}
        >
          <button
            onClick={handleCancelPolicy}
            style={{
              padding: '5px 10px', // Diminuído o padding para ficar menor e retangular
              backgroundColor: '#dc3545', // Vermelho
              color: '#fff',
              border: 'none',
              borderRadius: '15px', // Borda arredondada
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Apólice Cancelada?
          </button>
        </div>
      )}
      
      {/* CAMPOS ATUALIZADOS AQUI */}
      <p><strong>Nome:</strong> {lead.name}</p>
      <p><strong>Modelo do veículo:</strong> {lead.vehicleModel}</p>
      <p><strong>Ano/Modelo:</strong> {lead.vehicleYearModel}</p>
      <p><strong>Telefone:</strong> {lead.phone}</p>
      <p><strong>Seguradora:</strong> {lead.Seguradora || 'N/A'}</p>
      <p><strong>Prêmio Líquido:</strong> {formatCurrency(lead.PremioLiquido)}</p>
      <p><strong>Comissão:</strong> {lead.Comissao}%</p>
      <p><strong>Parcelamento:</strong> {lead.Parcelamento || 'N/A'}</p>
      <p><strong>Vigência Final:</strong> {formatDateDisplay(lead.VigenciaFinal) || 'N/A'}</p>
      {/* FIM DOS CAMPOS ATUALIZADOS */}
      
      <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <select
          value={status}
          onChange={(e) => {
            const newStatus = e.target.value;
            setStatus(newStatus);
            if (newStatus === 'Agendar') {
              setShowCalendar(true);
            } else {
              setShowCalendar(false);
            }
          }}
          // O select é desabilitado se o status já foi confirmado
          disabled={isStatusConfirmed}
          style={{
            marginRight: '10px',
            padding: '8px',
            border: '2px solid #ccc',
            borderRadius: '4px',
            minWidth: '160px',
            // Estilo para indicar que está desabilitado
            backgroundColor: isStatusConfirmed ? '#e9ecef' : '#fff',
            cursor: isStatusConfirmed ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="">Selecione o status</option>
          {/* REMOVIDO: <option value="Novo">Novo</option> */}
          <option value="Agendar">Agendar</option>
          <option value="Em Contato">Em Contato</option>
          <option value="Fechado">Fechado</option>
          <option value="Perdido">Perdido</option>
          <option value="Sem Contato">Sem Contato</option>
          {/* A opção 'Apólice Cancelada' foi movida para o botão fixo */}
        </select>

        {/* Lógica condicional para exibir Confirmar ou Alterar */}
        {!isStatusConfirmed ? (
          <>
            {showCalendar ? (
              <>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  style={{
                    padding: '8px',
                    border: '2px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <button
                  onClick={handleScheduleConfirm}
                  disabled={!scheduledDate}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: !scheduledDate ? '#aaa' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !scheduledDate ? 'not-allowed' : 'pointer'
                  }}
                >
                  Confirmar Agendamento
                </button>
              </>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={disabledConfirm || !status || status === '' || status === 'Selecione o status'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: (disabledConfirm || !status || status === '' || status === 'Selecione o status') ? '#aaa' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (disabledConfirm || !status || status === '' || status === 'Selecione o status') ? 'not-allowed' : 'pointer'
                }}
              >
                Confirmar
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleAlterar}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107', // Cor amarela
              color: '#212529', // Texto escuro para contraste
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Alterar
          </button>
        )}
      </div>

      {/* REMOVIDO: Botão do WhatsApp */}
      {/*
      <div style={{ marginTop: '10px' }}>
        <a
          href={`https://wa.me/${lead.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#25D366',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '0.9em',
          }}
        >
          <Phone size={16} /> Enviar WhatsApp
        </a>
      </div>
      */}
    </div>
  );
};

export default Lead;
