import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Mantido, embora não usado no snippet fornecido

const CriarLead = () => {
  // Estados para os campos do formulário
  const [nomeLead, setNomeLead] = useState('');
  const [modeloVeiculo, setModeloVeiculo] = useState('');
  const [anoModelo, setAnoModelo] = useState('');
  const [cidade, setCidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoSeguro, setTipoSeguro] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [nomesResponsaveis, setNomesResponsaveis] = useState([]);
  const [mensagemFeedback, setMensagemFeedback] = useState(''); // Estado para a mensagem de feedback
  const [isLoading, setIsLoading] = useState(false); // Novo estado para controlar o carregamento

  const navigate = useNavigate();

  // MUITO IMPORTANTE: SUBSTITUA ESTE URL PELA URL REAL E ATUALIZADA DA SUA IMPLANTAÇÃO DO GOOGLE APPS SCRIPT
  // CADA NOVA IMPLANTAÇÃO PODE GERAR UMA NOVA URL.
  // Usaremos a mesma base para todas as operações
  const GOOGLE_SHEETS_BASE_URL = '/api/gas'; // Sua URL de implantação

  // Função para buscar os nomes dos responsáveis ao carregar o componente
  useEffect(() => {
    const buscarNomesResponsaveis = async () => {
      try {
        // Para listar usuários, você já usa '?v=pegar_usuario' no App.js, então vamos usá-lo aqui também.
        const response = await fetch(`${GOOGLE_SHEETS_BASE_URL}?v=pegar_usuario`, {
            mode: 'cors' // Para requisições GET, é geralmente seguro usar 'cors' se o Apps Script permitir.
        });
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Filtra para garantir que apenas nomes válidos sejam adicionados e remove duplicatas, se houver
          const nomes = data.map(user => user.nome).filter(Boolean); 
          setNomesResponsaveis(nomes);
        } else {
          setNomesResponsaveis([]);
          console.warn('Resposta inesperada ao buscar responsáveis:', data);
        }
      } catch (error) {
        console.error('Erro ao buscar nomes de responsáveis:', error);
        setMensagemFeedback('❌ Erro ao carregar a lista de responsáveis. Verifique o console e o Apps Script.');
      }
    };

    buscarNomesResponsaveis();
  }, []); // O array vazio garante que este useEffect roda apenas uma vez ao montar o componente

  const handleCriar = async () => {
    setMensagemFeedback(''); // Limpa qualquer mensagem anterior

    // Validação dos campos obrigatórios
    if (!nomeLead || !modeloVeiculo || !anoModelo || !cidade || !telefone || !tipoSeguro || !responsavel) {
      setMensagemFeedback('⚠️ Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true); // Inicia o estado de carregamento

    // Objeto lead com os nomes das chaves correspondentes ao que o seu script GAS espera
    // na função doPost para o parâmetro 'criar_lead'.
    const novoLead = {
      nome: nomeLead,
      modeloVeiculo: modeloVeiculo,
      anoModelo: anoModelo,
      cidade: cidade,
      telefone: telefone,
      tipoSeguro: tipoSeguro,
      // dataCriacao deve ser uma string ISO para ser facilmente parseada pelo `new Date()` no GAS
      dataCriacao: new Date().toISOString(), 
      responsavel: responsavel,
    };

    try {
      // Chama a função para enviar o lead para o GAS
      await criarLeadFunc(novoLead); 

      setMensagemFeedback('✅ Lead criado com sucesso!.'); // Mensagem de sucesso
      // Limpeza do formulário após sucesso
      setNomeLead('');
      setModeloVeiculo('');
      setAnoModelo('');
      setCidade('');
      setTelefone('');
      setTipoSeguro('');
      setResponsavel('');
    } catch (error) {
      setMensagemFeedback('❌ Erro ao criar o lead. Verifique sua conexão ou tente novamente. Detalhes no console.'); // Mensagem de erro
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  };

  const criarLeadFunc = async (lead) => {
    try {
      // O parâmetro 'v' agora é 'criar_lead' para corresponder ao seu script GAS
      const response = await fetch(`${GOOGLE_SHEETS_BASE_URL}?v=criar_lead`, { 
        method: 'POST',
        // Mantido 'no-cors' conforme sua solicitação.
                         // ATENÇÃO: No modo 'no-cors', o JavaScript não consegue ler a resposta do servidor.
                         // Isso significa que a mensagem de sucesso no frontend é baseada na *tentativa* de envio,
                         // e não na confirmação real do GAS. Para uma confirmação real, o GAS precisaria permitir CORS
                         // e você usaria `mode: 'cors'` aqui.
        headers: {
          // MUITO IMPORTANTE: Use 'text/plain;charset=utf-8' para que o GAS possa interpretar o JSON
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify(lead),
      });

      console.log('Requisição de criação de lead enviada (modo no-cors).');
      console.log('É necessário verificar os logs de execução do Google Apps Script para confirmar o sucesso, pois a resposta não é lida aqui.');

      // No modo 'no-cors', response.ok sempre será true para requisições bem-sucedidas em nível de rede,
      // mas não indica sucesso da aplicação no GAS.
      // Se você mudar para 'cors', adicione:
      // if (!response.ok) {
      //   throw new Error(`Erro HTTP! status: ${response.status}`);
      // }
      // const result = await response.json(); // Se o GAS retornar JSON
      // console.log('Resposta do GAS (se CORS permitido):', result);

    } catch (error) {
      console.error('Erro ao enviar lead para o Google Sheets:', error);
      throw error; // Re-lança o erro para que handleCriar possa tratá-lo
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">Criar Novo Lead</h2>

      {/* Campos do formulário */}
      <div>
        <label className="block text-gray-700">Nome do Cliente</label>
        <input
          type="text"
          value={nomeLead}
          onChange={(e) => setNomeLead(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nome completo do lead"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700">Modelo do Veículo</label>
        <input
          type="text"
          value={modeloVeiculo}
          onChange={(e) => setModeloVeiculo(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ex: Fiat Palio, Honda Civic"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700">Ano/Modelo</label>
        <input
          type="text"
          value={anoModelo}
          onChange={(e) => setAnoModelo(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ex: 2020/2021"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700">Cidade</label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Cidade do cliente"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700">Telefone</label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ex: (XX) XXXXX-XXXX"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700">Tipo de Seguro</label>
        <select
          value={tipoSeguro}
          onChange={(e) => setTipoSeguro(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Selecione um tipo</option>
          <option value="Novo">Novo</option> 
          <option value="Renovacao">Renovação</option>
          <option value="Indicacao">Indicação</option>
        </select>
      </div>

      {/* Campo Responsável agora é um select populado dinamicamente */}
      <div>
        <label className="block text-gray-700">Responsável</label>
        <select
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Selecione o Responsável</option>
          {nomesResponsaveis.map((nome, index) => (
            <option key={index} value={nome}>
              {nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={handleCriar}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading} // Desabilita o botão enquanto estiver carregando
        >
          {isLoading ? 'Criando Lead...' : 'Criar Lead'}
        </button>
        {mensagemFeedback && (
          <p className={`mt-4 font-semibold text-center ${mensagemFeedback.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {mensagemFeedback}
          </p>
        )}
      </div>
    </div>
  );
};

export default CriarLead;
