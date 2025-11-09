// src/services/leadService.js
export async function buscarLeadsNaoAtribuidos() {
  const url = '/api/gas'; // Substitua SEU_DEPLOY_ID pelo seu ID de deploy
  const params = new URLSearchParams({ acao: 'listarLeadsNaoAtribuidos' });

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
    });
    const data = await response.json();

    if (data.status === 'ok') {
      return data.leads;
    } else {
      throw new Error(data.mensagem || 'Erro ao buscar leads');
    }
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return [];
  }
}
