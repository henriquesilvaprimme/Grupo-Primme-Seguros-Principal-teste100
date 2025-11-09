import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Search, ChevronLeft, ChevronRight, CheckCircle, DollarSign, Calendar } from 'lucide-react';

// ===============================================
// 1. COMPONENTE PRINCIPAL: LeadsFechados
// ===============================================

const LeadsFechados = ({ leads, usuarios, onUpdateInsurer, onConfirmInsurer, onUpdateDetalhes, fetchLeadsFechadosFromSheet, isAdmin, scrollContainerRef }) => {
    // --- ESTADOS ---
    const [fechadosFiltradosInterno, setFechadosFiltradosInterno] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const leadsPorPagina = 10;

    const [valores, setValores] = useState({});
    const [vigencia, setVigencia] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [nomeInput, setNomeInput] = useState('');
    
    // NOVOS ESTADOS
    const [meioPagamento, setMeioPagamento] = useState({});
    const [cartaoPortoNovo, setCartaoPortoNovo] = useState({});
    
    const getMesAnoAtual = () => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        return `${ano}-${mes}`; // Formato: AAAA-MM
    };
    const [dataInput, setDataInput] = useState(getMesAnoAtual());
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroData, setFiltroData] = useState(getMesAnoAtual());
    const [premioLiquidoInputDisplay, setPremioLiquidoInputDisplay] = useState({});

    // --- FUNÇÕES DE LÓGICA (CORRIGIDA) ---
    
    /**
     * GARANTIA DE FORMATO: Converte DD/MM/AAAA para AAAA-MM-DD sem depender de new Date().
     * ESSA CORREÇÃO GARANTE QUE O DIA 01 NÃO É INTERPRETADO ERRADO.
     * @param {string} dataStr - Data de entrada (espera DD/MM/AAAA)
     * @returns {string} Data formatada (AAAA-MM-DD)
     */
    const getDataParaComparacao = (dataStr) => {
        if (!dataStr) return '';
        dataStr = String(dataStr).trim();

        const parts = dataStr.split('/');
        
        // Trata o formato DD/MM/AAAA
        if (parts.length === 3) {
            const [dia, mes, ano] = parts;
            // Verifica se são números e garante a padronização
            if (!isNaN(parseInt(dia)) && !isNaN(parseInt(mes)) && !isNaN(parseInt(ano))) {
                return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            }
        }
        
        // Se já estiver em AAAA-MM-DD, retorna como está (para o caso de ser uma data de vigência)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
            return dataStr;
        }

        return ''; // Retorna vazio se não conseguir formatar
    };

    const normalizarTexto = (texto = '') => {
        return texto
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const nomeContemFiltro = (leadNome, filtroNome) => {
        if (!filtroNome) return true;
        if (!leadNome) return false;

        const nomeNormalizado = normalizarTexto(leadNome);
        const filtroNormalizado = normalizarTexto(filtroNome);

        return nomeNormalizado.includes(filtroNormalizado);
    };

    const scrollToTop = () => {
        if (scrollContainerRef && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const aplicarFiltroNome = () => {
        const filtroLimpo = nomeInput.trim();
        setFiltroNome(filtroLimpo);
        setFiltroData('');
        setDataInput('');
        setPaginaAtual(1);
        scrollToTop();
    };

    const aplicarFiltroData = () => {
        setFiltroData(dataInput); // dataInput está no formato AAAA-MM
        setFiltroNome('');
        setNomeInput('');
        setPaginaAtual(1);
        scrollToTop();
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await fetchLeadsFechadosFromSheet();
        } catch (error) {
            console.error('Erro ao atualizar leads fechados:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- EFEITO DE CARREGAMENTO INICIAL ---
    useEffect(() => {
        handleRefresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // --- EFEITO DE FILTRAGEM E SINCRONIZAÇÃO DE ESTADOS ---
    useEffect(() => {
        const fechadosAtuais = leads.filter(lead => lead.Status === 'Fechado');

        // --------------------------------------------------------------------------------
        // Sincronização de estados (Gerais)
        // --------------------------------------------------------------------------------
        setValores(prevValores => {
            const novosValores = { ...prevValores };
            fechadosAtuais.forEach(lead => {
                const rawPremioFromApi = String(lead.PremioLiquido || '');
                const premioFromApi = parseFloat(rawPremioFromApi.replace('.', '').replace(',', '.'));
                const premioInCents = isNaN(premioFromApi) || rawPremioFromApi === '' ? null : Math.round(premioFromApi * 100);

                const apiComissao = lead.Comissao ? String(lead.Comissao).replace('.', ',') : '';
                const apiParcelamento = lead.Parcelamento || '';
                const apiInsurer = lead.Seguradora || '';

                if (!novosValores[lead.ID] ||
                    (novosValores[lead.ID].PremioLiquido === undefined && premioInCents !== null) ||
                    (novosValores[lead.ID].PremioLiquido !== premioInCents && prevValores[lead.ID]?.PremioLiquido === undefined) ||
                    (novosValores[lead.ID].Comissao === undefined && apiComissao !== '') ||
                    (novosValores[lead.ID].Comissao !== apiComissao && prevValores[lead.ID]?.Comissao === undefined) ||
                    (novosValores[lead.ID].Parcelamento === undefined && apiParcelamento !== '') ||
                    (novosValores[lead.ID].Parcelamento !== apiParcelamento && prevValores[lead.ID]?.Parcelamento === undefined) ||
                    (novosValores[lead.ID].insurer === undefined && apiInsurer !== '') ||
                    (novosValores[lead.ID].insurer !== apiInsurer && prevValores[lead.ID]?.insurer === undefined)
                ) {
                    novosValores[lead.ID] = {
                        ...novosValores[lead.ID],
                        PremioLiquido: premioInCents,
                        Comissao: apiComissao,
                        Parcelamento: apiParcelamento,
                        insurer: apiInsurer,
                    };
                }
            });
            return novosValores;
        });
        
        // SINCRONIZAÇÃO NOVOS ESTADOS: Meio de Pagamento
        setMeioPagamento(prevMeioPagamento => {
            const novosMeios = { ...prevMeioPagamento };
            fechadosAtuais.forEach(lead => {
                const apiMeioPagamento = lead.MeioPagamento || '';
                if (!novosMeios[lead.ID] || (apiMeioPagamento !== '' && prevMeioPagamento[lead.ID] === undefined)) {
                    novosMeios[lead.ID] = apiMeioPagamento;
                }
            });
            return novosMeios;
        });

        // SINCRONIZAÇÃO NOVOS ESTADOS: Cartão Porto Seguro novo
        setCartaoPortoNovo(prevCartaoPortoNovo => {
            const novosCartoes = { ...prevCartaoPortoNovo };
            fechadosAtuais.forEach(lead => {
                const apiCartaoPortoNovo = lead.CartaoPortoNovo || '';
                if (!novosCartoes[lead.ID] || (apiCartaoPortoNovo !== '' && prevCartaoPortoNovo[lead.ID] === undefined)) {
                    novosCartoes[lead.ID] = apiCartaoPortoNovo;
                }
            });
            return novosCartoes;
        });
        
        // Sincronização de estados (Display e Vigência) - Mantida
        setPremioLiquidoInputDisplay(prevDisplay => {
            const newDisplay = { ...prevDisplay };
            fechadosAtuais.forEach(lead => {
                const currentPremio = String(lead.PremioLiquido || '');
                if (currentPremio !== '') {
                    const premioFloat = parseFloat(currentPremio.replace(',', '.'));
                    newDisplay[lead.ID] = isNaN(premioFloat) ? '' : premioFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else if (prevDisplay[lead.ID] === undefined) {
                    newDisplay[lead.ID] = '';
                }
            });
            return newDisplay;
        });

        setVigencia(prevVigencia => {
            const novasVigencias = { ...prevVigencia };
            fechadosAtuais.forEach(lead => {
                const vigenciaInicioStrApi = String(lead.VigenciaInicial || '');
                const vigenciaFinalStrApi = String(lead.VigenciaFinal || '');

                if (!novasVigencias[lead.ID] || (novasVigencias[lead.ID].inicio === undefined && vigenciaInicioStrApi !== '') || (novasVigencias[lead.ID].inicio !== vigenciaInicioStrApi && prevVigencia[lead.ID]?.inicio === undefined)) {
                    novasVigencias[lead.ID] = {
                        ...novasVigencias[lead.ID],
                        inicio: vigenciaInicioStrApi,
                    };
                }
                if (!novasVigencias[lead.ID] || (novasVigencias[lead.ID].final === undefined && vigenciaFinalStrApi !== '') || (novasVigencias[lead.ID].final !== vigenciaFinalStrApi && prevVigencia[lead.ID]?.final === undefined)) {
                    novasVigencias[lead.ID] = {
                        ...novasVigencias[lead.ID],
                        final: vigenciaFinalStrApi,
                    };
                }
            });
            return novasVigencias;
        });
        // --------------------------------------------------------------------------------

        // ORDENAÇÃO: Ainda precisa de new Date() para ordenar corretamente
        const fechadosOrdenados = [...fechadosAtuais].sort((a, b) => {
            // Adiciona 'T00:00:00' para mitigar o fuso horário durante a ORDENAÇÃO
            const dataA = new Date(getDataParaComparacao(a.Data) + 'T00:00:00');
            const dataB = new Date(getDataParaComparacao(b.Data) + 'T00:00:00');
            return dataB.getTime() - dataA.getTime();
        });

        // Aplicação da lógica de filtragem (CORRIGIDA)
        let leadsFiltrados;
        if (filtroNome) {
            leadsFiltrados = fechadosOrdenados.filter(lead =>
                nomeContemFiltro(lead.name, filtroNome)
            );
        } else if (filtroData) {
            leadsFiltrados = fechadosOrdenados.filter(lead => {
                // 1. Converte a data do lead para AAAA-MM-DD usando a função IMUNE A NEW DATE()
                const dataLeadFormatada = getDataParaComparacao(lead.Data);
                
                // 2. Extrai AAAA-MM para comparação (ex: '2025-10-01' -> '2025-10')
                const dataLeadMesAno = dataLeadFormatada ? dataLeadFormatada.substring(0, 7) : '';
                
                // 3. Compara o AAAA-MM do lead com o AAAA-MM do filtro ('2025-10' === '2025-10')
                return dataLeadMesAno === filtroData;
            });
        } else {
            leadsFiltrados = fechadosOrdenados;
        }

        setFechadosFiltradosInterno(leadsFiltrados);
    }, [leads, filtroNome, filtroData]);


    // --- FUNÇÕES DE HANDLER (NOVAS E EXISTENTES) ---

    const formatarMoeda = (valorCentavos) => {
        if (valorCentavos === null || isNaN(valorCentavos)) return '';
        return (valorCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handlePremioLiquidoChange = (id, valor) => {
        let cleanedValue = valor.replace(/[^\d,\.]/g, '');
        const commaParts = cleanedValue.split(',');
        if (commaParts.length > 2) {
            cleanedValue = commaParts[0] + ',' + commaParts.slice(1).join('');
        }
        
        if (commaParts.length > 1 && commaParts[1].length > 2) {
            cleanedValue = commaParts[0] + ',' + commaParts[1].slice(0, 2);
        }
        
        setPremioLiquidoInputDisplay(prev => ({
            ...prev,
            [`${id}`]: cleanedValue,
        }));

        const valorParaParse = cleanedValue.replace(/\./g, '').replace(',', '.');
        const valorEmReais = parseFloat(valorParaParse);
        const valorParaEstado = isNaN(valorEmReais) || cleanedValue === '' ? null : Math.round(valorEmReais * 100);

        setValores(prev => ({
            ...prev,
            [`${id}`]: {
                ...prev[`${id}`],
                PremioLiquido: valorParaEstado,
            },
        }));
    };

    const handlePremioLiquidoBlur = (id) => {
        const valorCentavos = valores[`${id}`]?.PremioLiquido;
        let valorReais = null;

        if (valorCentavos !== null && !isNaN(valorCentavos)) {
            valorReais = valorCentavos / 100;
        }

        setPremioLiquidoInputDisplay(prev => ({
            ...prev,
            [`${id}`]: valorCentavos !== null && !isNaN(valorCentavos) ? formatarMoeda(valorCentavos) : '',
        }));

        onUpdateDetalhes(id, 'PremioLiquido', valorReais);
    };

    // FUNÇÃO ATUALIZADA: Limpa o '%' para a lógica interna e extrai o valor float para a API.
    const handleComissaoChange = (id, valor) => {
        // 1. Remove o '%' e limpa caracteres não numéricos ou a vírgula/ponto
        let cleanedValue = valor.toString().replace(/%/g, '').replace(/[^\d,]/g, '');

        // 2. Garante apenas uma vírgula para separar decimais e máximo de duas casas
        const parts = cleanedValue.split(',');
        if (parts.length > 2) {
            cleanedValue = parts[0] + ',' + parts.slice(1).join('');
        }
        if (parts.length > 1 && parts[1].length > 2) {
            cleanedValue = parts[0] + ',' + parts[1].slice(0, 2);
        }

        // 3. Atualiza o estado interno (que é o valor visível no campo, sem %)
        setValores(prev => ({
            ...prev,
            [`${id}`]: {
                ...prev[`${id}`],
                Comissao: cleanedValue,
            },
        }));

        // 4. Converte para ponto decimal para enviar para a API (onUpdateDetalhes espera float)
        const valorFloat = parseFloat(cleanedValue.replace(',', '.'));
        
        // 5. Envia o valor float (ou string vazia se for NaN)
        onUpdateDetalhes(id, 'Comissao', isNaN(valorFloat) ? '' : valorFloat);
    };

    const handleParcelamentoChange = (id, valor) => {
        setValores(prev => ({
            ...prev,
            [`${id}`]: {
                ...prev[`${id}`],
                Parcelamento: valor,
            },
        }));
        onUpdateDetalhes(id, 'Parcelamento', valor);
    };

    const handleInsurerChange = (id, valor) => {
        setValores(prev => ({
            ...prev,
            [`${id}`]: {
                ...prev[`${id}`],
                insurer: valor,
            },
        }));
        // Se a seguradora for alterada para uma que não requer o campo Cartão Porto Novo, limpa o estado
        const seguradorasComCartaoPortoNovo = ['Porto Seguro', 'Azul Seguros', 'Itau Seguros'];
        if (!seguradorasComCartaoPortoNovo.includes(valor)) {
            setCartaoPortoNovo(prev => ({
                ...prev,
                [`${id}`]: '',
            }));
            // O ideal seria também chamar onUpdateDetalhes para limpar na planilha se a seguradora mudar
            onUpdateDetalhes(id, 'CartaoPortoNovo', '');
        }
    };
    
    // NOVO HANDLER: Meio de Pagamento
    const handleMeioPagamentoChange = (id, valor) => {
        setMeioPagamento(prev => ({
            ...prev,
            [`${id}`]: valor,
        }));
        onUpdateDetalhes(id, 'MeioPagamento', valor);

        // Se o meio de pagamento for alterado para algo diferente de CP, limpa o estado
        if (valor !== 'CP') {
            setCartaoPortoNovo(prev => ({
                ...prev,
                [`${id}`]: '',
            }));
             // O ideal seria também chamar onUpdateDetalhes para limpar na planilha se o MeioPagamento mudar
            onUpdateDetalhes(id, 'CartaoPortoNovo', '');
        }
    };

    // NOVO HANDLER: Cartão Porto Seguro novo
    const handleCartaoPortoNovoChange = (id, valor) => {
        setCartaoPortoNovo(prev => ({
            ...prev,
            [`${id}`]: valor,
        }));
        onUpdateDetalhes(id, 'CartaoPortoNovo', valor);
    };


    const handleVigenciaInicioChange = (id, dataString) => {
        let dataFinal = '';
        if (dataString) {
            // Usa 'T00:00:00' para evitar problemas com fuso horário
            const dataInicioObj = new Date(dataString + 'T00:00:00'); 
            if (!isNaN(dataInicioObj.getTime())) {
                const anoInicio = dataInicioObj.getFullYear();
                const mesInicio = String(dataInicioObj.getMonth() + 1).padStart(2, '0');
                const diaInicio = String(dataInicioObj.getDate()).padStart(2, '0');

                const anoFinal = anoInicio + 1;
                dataFinal = `${anoFinal}-${mesInicio}-${diaInicio}`;
            }
        }

        setVigencia(prev => ({
            ...prev,
            [`${id}`]: {
                ...prev[`${id}`],
                inicio: dataString,
                final: dataFinal,
            },
        }));
    };

    // --- LÓGICA DE PAGINAÇÃO (Mantida) ---
    const totalPaginas = Math.max(1, Math.ceil(fechadosFiltradosInterno.length / leadsPorPagina));
    const paginaCorrigida = Math.min(paginaAtual, totalPaginas); 
    const inicio = (paginaCorrigida - 1) * leadsPorPagina;
    const fim = inicio + leadsPorPagina;
    const leadsPagina = fechadosFiltradosInterno.slice(inicio, fim);
    
    // Lista de seguradoras que REQUEREM o campo Cartão Porto Novo
    const seguradorasComCartaoPortoNovo = ['Porto Seguro', 'Azul Seguros', 'Itau Seguros'];

    const handlePaginaAnterior = () => {
        setPaginaAtual(prev => Math.max(prev - 1, 1));
        scrollToTop();
    };

    const handlePaginaProxima = () => {
        setPaginaAtual(prev => Math.min(prev + 1, totalPaginas));
        scrollToTop();
    };

    // --- RENDERIZAÇÃO E NOVO LAYOUT ---
    return (
        <div className="p-4 md:p-6 lg:p-8 relative min-h-screen bg-gray-100 font-sans">

            {/* Overlay de Loading */}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="ml-4 text-xl font-semibold text-gray-700 mt-3">Carregando Leads Concluídos...</p>
                    </div>
                </div>
            )}

            {/* Cabeçalho Principal (Moderno) */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                        <CheckCircle size={32} className="text-green-500 mr-3" />
                        Renovados
                    </h1>
                    
                    <button
                        title="Atualizar dados"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className={`p-3 rounded-full transition duration-300 ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-100 shadow-sm'}`}
                    >
                        <RefreshCcw size={24} className={isLoading ? '' : 'hover:rotate-180'} />
                    </button>
                </div>
                
                {/* Controles de Filtro (Inline) */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                    {/* Filtro de Nome */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={nomeInput}
                            onChange={(e) => setNomeInput(e.target.value)}
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                        <button 
                            onClick={aplicarFiltroNome}
                            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 shadow-md"
                        >
                            <Search size={20} />
                        </button>
                    </div>

                    {/* Filtro de Data */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end">
                        <input
                            type="month"
                            value={dataInput}
                            onChange={(e) => setDataInput(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg cursor-pointer text-sm"
                            title="Filtrar por Mês/Ano de Criação"
                        />
                        <button 
                            onClick={aplicarFiltroData}
                            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 shadow-md whitespace-nowrap"
                        >
                            Filtrar Data
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Lista de Cards de Leads */}
            <div className="space-y-5">
                {fechadosFiltradosInterno.length === 0 && !isLoading ? (
                    <div className="text-center p-12 bg-white rounded-xl shadow-md text-gray-600 text-lg">
                        <p> Você não tem nenhum cliente renovado no período filtrado. </p>
                    </div>
                ) : (
                    leadsPagina.map((lead) => {
                        const responsavel = usuarios.find((u) => u.nome === lead.Responsavel);
                        const isSeguradoraPreenchida = !!lead.Seguradora;
                        
                        // Lógica para verificar se a seguradora atual e o meio de pagamento REQUEREM o campo Cartão Porto Novo
                        const currentInsurer = valores[`${lead.ID}`]?.insurer;
                        const currentMeioPagamento = meioPagamento[`${lead.ID}`];

                        // NOVO REQUISITO: Requer Cartão Porto Novo se a seguradora for uma das listadas E o meio de pagamento for 'CP'
                        const requiresCartaoPortoNovo = seguradorasComCartaoPortoNovo.includes(currentInsurer) && currentMeioPagamento === 'CP';

                        // Condição de validação para Cartão Porto Novo
                        const cartaoPortoNovoInvalido = requiresCartaoPortoNovo && (!cartaoPortoNovo[`${lead.ID}`] || cartaoPortoNovo[`${lead.ID}`] === '');
                        
                        // Lógica de desativação do botão de confirmação
                        const isButtonDisabled =
                            !currentInsurer ||
                            valores[`${lead.ID}`]?.PremioLiquido === null ||
                            valores[`${lead.ID}`]?.PremioLiquido === undefined ||
                            !valores[`${lead.ID}`]?.Comissao ||
                            parseFloat(String(valores[`${lead.ID}`]?.Comissao || '0').replace(',', '.')) === 0 ||
                            !valores[`${lead.ID}`]?.Parcelamento ||
                            valores[`${lead.ID}`]?.Parcelamento === '' ||
                            !vigencia[`${lead.ID}`]?.inicio ||
                            !vigencia[`${lead.ID}`]?.final ||
                            !currentMeioPagamento ||
                            currentMeioPagamento === '' ||
                            cartaoPortoNovoInvalido; // Novo requisito de validação

                        return (
                            <div 
                                key={lead.ID}
                                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative border-t-4 ${isSeguradoraPreenchida ? 'border-green-600' : 'border-amber-500'}`}
                            >
                                {/* COLUNA 1: Informações do Lead */}
                                <div className="col-span-1 border-b pb-4 lg:border-r lg:pb-0 lg:pr-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{lead.name}</h3>
                                    
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p><strong>Modelo:</strong> {lead.vehicleModel}</p>
                                        <p><strong>Ano/Modelo:</strong> {lead.vehicleYearModel}</p>
                                        <p><strong>Cidade:</strong> {lead.city}</p>
                                        <p><strong>Telefone:</strong> {lead.phone}</p>
                                    </div>

                                    {responsavel && isAdmin && (
                                        <p className="mt-4 text-sm font-semibold text-green-600 bg-green-50 p-2 rounded-lg">
                                            Transferido para: <strong>{responsavel.nome}</strong>
                                        </p>
                                    )}
                                </div>

                                {/* COLUNA 2: Detalhes do Fechamento (Alterado) */}
                                <div className="col-span-1 border-b pb-4 lg:border-r lg:pb-0 lg:px-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                        <DollarSign size={18} className="mr-2 text-green-500" />
                                        Detalhes do Fechamento
                                    </h3>
                                    
                                    {/* Seguradora (Select) */}
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Seguradora</label>
                                        <select
                                            value={currentInsurer || ''}
                                            onChange={(e) => handleInsurerChange(lead.ID, e.target.value)}
                                            disabled={isSeguradoraPreenchida}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-150 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="">Selecione a seguradora</option>
                                            <option value="Porto Seguro">Porto Seguro</option>
                                            <option value="Azul Seguros">Azul Seguros</option>
                                            <option value="Itau Seguros">Itau Seguros</option>
                                            <option value="Demais Seguradoras">Demais Seguradoras</option>
                                            <option value="Tokio">Tokio</option>
                                            <option value="Yelum">Yelum</option>
                                            <option value="Bradesco">Bradesco</option>
                                            <option value="Allianz">Allianz</option>
                                            <option value="Suhai">Suhai</option>
                                            <option value="Hdi">Hdi</option>
                                            <option value="Zurich">Zurich</option>
                                            <option value="Mitsui">Mitsui</option>
                                            <option value="Mapfre">Mapfre</option>
                                            <option value="Alfa">Alfa</option>
                                        </select>
                                    </div>
                                    
                                    {/* Meio de Pagamento (NOVO) */}
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Meio de Pagamento</label>
                                        <select
                                            value={currentMeioPagamento || ''}
                                            onChange={(e) => handleMeioPagamentoChange(lead.ID, e.target.value)}
                                            disabled={isSeguradoraPreenchida}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-150 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value=""> </option>
                                            <option value="CP">CP</option>
                                            <option value="CC">CC</option>
                                            <option value="Debito">Debito</option>
                                            <option value="Boleto">Boleto</option>
                                        </select>
                                    </div>

                                    {/* Cartão Porto Seguro Novo (Condicional: Seguradora IN [Porto, Azul, Itau] E MeioPagamento == 'CP') */}
                                    {requiresCartaoPortoNovo && (
                                        <div className="mb-4">
                                            <label className="text-xs font-semibold text-gray-600 block mb-1">Cartão Porto Seguro Novo?</label>
                                            <select
                                                value={cartaoPortoNovo[`${lead.ID}`] || ''}
                                                onChange={(e) => handleCartaoPortoNovoChange(lead.ID, e.target.value)}
                                                disabled={isSeguradoraPreenchida}
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-150 focus:ring-green-500 focus:border-green-500"
                                            >
                                                <option value=""> </option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Prêmio Líquido (Input) */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 block mb-1">Prêmio Líquido</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-sm">R$</span>
                                                <input
                                                    type="text"
                                                    placeholder="0,00"
                                                    value={premioLiquidoInputDisplay[`${lead.ID}`] || ''}
                                                    onChange={(e) => handlePremioLiquidoChange(lead.ID, e.target.value)}
                                                    onBlur={() => handlePremioLiquidoBlur(lead.ID)}
                                                    disabled={isSeguradoraPreenchida}
                                                    className="w-full p-2 pl-8 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-150 focus:ring-green-500 focus:border-green-500 text-right"
                                                />
                                            </div>
                                        </div>

                                        {/* Comissão (Input) */}
<div>
    <label className="text-xs font-semibold text-gray-600 block mb-1">Comissão (%)</label>
    <div className="relative">
        {/*
            *** ALTERAÇÃO: Mover o símbolo para a esquerda (left-3) ***
        */}
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-sm">%</span>
        <input
            type="text"
            placeholder="0,00"
            value={valores[`${lead.ID}`]?.Comissao || ''}
            onChange={(e) => handleComissaoChange(lead.ID, e.target.value)}
            disabled={isSeguradoraPreenchida}
            // *** ALTERAÇÃO: Adicionar padding à esquerda (pl-7) e remover o padding da direita (pr-5 -> p-2) ***
            className="w-full p-2 pl-7 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-150 focus:ring-green-500 focus:border-green-500 text-right"
        />
    </div>
</div>

                                        {/* Parcelamento (Select) */}
                                        <div className="col-span-2">
                                            <label className="text-xs font-semibold text-gray-600 block mb-1">Parcelamento</label>
                                            <select
                                                value={valores[`${lead.ID}`]?.Parcelamento || ''}
                                                onChange={(e) => handleParcelamentoChange(lead.ID, e.target.value)}
                                                disabled={isSeguradoraPreenchida}
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-150 focus:ring-green-500 focus:border-green-500"
                                            >
                                                <option value="">Selecione o Parcelamento</option>
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i + 1} value={`${i + 1}`}>{i + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* COLUNA 3: Vigência e Ação de Confirmação */}
                                <div className="col-span-1 lg:pl-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                        <Calendar size={18} className="mr-2 text-green-500" />
                                        Vigência
                                    </h3>

                                    {/* Vigência Início */}
                                    <div className="mb-4">
                                        <label htmlFor={`vigencia-inicio-${lead.ID}`} className="text-xs font-semibold text-gray-600 block mb-1">Início</label>
                                        <input
                                            id={`vigencia-inicio-${lead.ID}`}
                                            type="date"
                                            value={vigencia[`${lead.ID}`]?.inicio || ''}
                                            onChange={(e) => handleVigenciaInicioChange(lead.ID, e.target.value)}
                                            disabled={isSeguradoraPreenchida}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-150 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    {/* Vigência Final (Readonly) */}
                                    <div className="mb-6">
                                        <label htmlFor={`vigencia-final-${lead.ID}`} className="text-xs font-semibold text-gray-600 block mb-1">Término (Automático)</label>
                                        <input
                                            id={`vigencia-final-${lead.ID}`}
                                            type="date"
                                            value={vigencia[`${lead.ID}`]?.final || ''}
                                            readOnly
                                            disabled={true}
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Botão de Ação (Alterado para incluir novos campos) */}
                                    {!isSeguradoraPreenchida ? (
                                        <button
                                            onClick={async () => {
                                                await onConfirmInsurer(
                                                    lead.ID,
                                                    valores[`${lead.ID}`]?.PremioLiquido === null ? null : valores[`${lead.ID}`]?.PremioLiquido / 100,
                                                    currentInsurer,
                                                    parseFloat(String(valores[`${lead.ID}`]?.Comissao || '0').replace(',', '.')),
                                                    valores[`${lead.ID}`]?.Parcelamento,
                                                    vigencia[`${lead.ID}`]?.final,
                                                    vigencia[`${lead.ID}`]?.inicio,
                                                    // NOVOS PARÂMETROS ADICIONADOS AQUI
                                                    currentMeioPagamento, 
                                                    cartaoPortoNovo[`${lead.ID}`] 
                                                );
                                                // Note: Esta chamada é crucial para o seu fluxo de atualização pós-confirmação
                                                await fetchLeadsFechadosFromSheet(); 
                                            }}
                                            disabled={isButtonDisabled || isLoading}
                                            className={`flex items-center justify-center w-full px-4 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-200 ${
                                                isButtonDisabled || isLoading
                                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                        >
                                            <CheckCircle size={20} className="mr-2" /> 
                                            Confirmar Renovação
                                        </button>
                                    ) : (
                                        <div className="text-center p-3 bg-green-100 border border-green-300 rounded-lg">
                                            <span className="text-sm text-green-800 font-bold">
                                                Renovado!
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Paginação */}
            <div className="flex justify-center items-center gap-6 mt-8 p-4 bg-white rounded-xl shadow-md">
                <button
                    onClick={handlePaginaAnterior}
                    disabled={paginaCorrigida <= 1 || isLoading}
                    className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition duration-150 flex items-center shadow-md"
                >
                    <ChevronLeft size={20} className="mr-1" /> Anterior
                </button>
                <span className="text-gray-700 font-medium text-lg">
                    Página <strong className="text-green-600">{paginaCorrigida}</strong> de {totalPaginas}
                </span>
                <button
                    onClick={handlePaginaProxima}
                    disabled={paginaCorrigida >= totalPaginas || isLoading}
                    className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition duration-150 flex items-center shadow-md"
                >
                    Próxima <ChevronRight size={20} className="ml-1" />
                </button>
            </div>
        </div>
    );
};

export default LeadsFechados;
