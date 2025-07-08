import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs"; // Import dayjs for date formatting

const EditarViagem = () => {
  const [viagens, setViagens] = useState([]);
  const [motoristas, setMotoristas] = useState([]); // Novo estado para motoristas
  const [edicao, setEdicao] = useState(null); // Estado para a viagem que está sendo editada
  const [modalSalvar, setModalSalvar] = useState(false); // Estado para o modal de confirmação de salvar
  const [modalFinalizar, setModalFinalizar] = useState({ aberto: false, id: null }); // Estado para o modal de confirmação de finalizar
  const [mensagem, setMensagem] = useState(""); // Para mensagens de sucesso
  const [erro, setErro] = useState("");         // Para mensagens de erro
  const [loading, setLoading] = useState(true); // Estado de carregamento inicial

  // useEffect para carregar viagens e motoristas ao montar o componente
  useEffect(() => {
    carregarViagens();
    carregarMotoristas();
  }, []);

  // Função para carregar as viagens ativas do backend
  const carregarViagens = () => {
    setLoading(true); // Inicia o carregamento
    setMensagem("");  // Limpa mensagens anteriores
    setErro("");      // Limpa erros anteriores
    axios.get("http://localhost:3001/viagens/ativas")
      .then(res => {
        setViagens(res.data);
        if (res.data.length === 0) {
          setMensagem("Nenhuma viagem ativa encontrada.");
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar viagens ativas:", error);
        setErro("Erro ao carregar viagens ativas. Tente novamente mais tarde.");
        setViagens([]); // Limpa dados em caso de erro
      })
      .finally(() => {
        setLoading(false); // Finaliza o carregamento
      });
  };

  // Função para carregar a lista de motoristas do backend
  const carregarMotoristas = () => {
    axios.get("http://localhost:3001/motoristas")
      .then(res => setMotoristas(res.data))
      .catch((error) => {
        console.error("Erro ao buscar motoristas:", error);
        setErro(prev => prev ? prev + " Erro ao carregar motoristas." : "Erro ao carregar motoristas."); // Adiciona ao erro existente
        setMotoristas([]); // Limpa motoristas em caso de erro
      });
  };

  // Lida com o clique no botão "Editar" de uma viagem
  const handleEditar = (viagemSelecionada) => {
    // Formata as datas para o formato "YYYY-MM-DD" esperado pelo input type="date"
    // Garante que motorista_id seja um número ou string vazia para o select
    setEdicao({
      ...viagemSelecionada,
      inicio: viagemSelecionada.inicio ? dayjs(viagemSelecionada.inicio).format('YYYY-MM-DD') : '',
      fim: viagemSelecionada.fim ? dayjs(viagemSelecionada.fim).format('YYYY-MM-DD') : '',
      motorista_id: viagemSelecionada.motorista_id || '', 
    });
  };

  // Abre o modal de confirmação para salvar edições
  const handleSalvar = () => {
    setModalSalvar(true);
  };

  // Confirma e envia as alterações da viagem para o backend
  const confirmarSalvar = async () => {
    setModalSalvar(false); // Fecha o modal imediatamente
    setMensagem("");      // Limpa mensagens
    setErro("");          // Limpa erros

    try {
      await axios.put(`http://localhost:3001/viagens/${edicao.id}`, edicao);
      setMensagem("Viagem atualizada com sucesso!");
      setEdicao(null); // Limpa o estado de edição
      carregarViagens(); // Recarrega a lista de viagens
    } catch (error) {
      console.error("Erro ao salvar alterações da viagem:", error);
      setErro(error.response?.data?.erro || "Erro ao salvar alterações. Tente novamente.");
    }
  };

  // Abre o modal de confirmação para finalizar uma viagem
  const handleFinalizar = (idViagem) => {
    setModalFinalizar({ aberto: true, id: idViagem });
  };

  // Confirma e envia a requisição para finalizar a viagem para o backend
  const confirmarFinalizar = async () => {
    setModalFinalizar({ aberto: false, id: null }); // Fecha o modal imediatamente
    setMensagem("");                               // Limpa mensagens
    setErro("");                                   // Limpa erros

    try {
      await axios.patch(`http://localhost:3001/viagens/${modalFinalizar.id}/finalizar`);
      setMensagem("Viagem finalizada com sucesso!");
      carregarViagens(); // Recarrega a lista para remover a viagem finalizada
    } catch (error) {
      console.error("Erro ao finalizar viagem:", error);
      setErro(error.response?.data?.erro || "Erro ao finalizar viagem. Tente novamente.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter py-8">
      <div className="max-w-4xl w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700">
        <h2 className="text-3xl font-bold mb-8 text-red-500 text-center">Editar ou Concluir Viagens</h2>

        {mensagem && (
          <p className="mb-6 text-center text-green-400 bg-green-900 bg-opacity-30 border border-green-700 rounded-md p-3">
            {mensagem}
          </p>
        )}
        {erro && (
          <p className="mb-6 text-center text-red-400 bg-red-900 bg-opacity-30 border border-red-700 rounded-md p-3">
            {erro}
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-400 mt-6">Carregando viagens ativas...</p>
        ) : viagens.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {viagens.map((v) => (
              <div key={v.id} className="bg-neutral-700 border border-red-600 p-4 rounded-lg shadow-md text-gray-100 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="mb-1"><strong className="text-red-400">Placa:</strong> {v.placa}</p>
                  <p className="mb-1"><strong className="text-red-400">Motorista:</strong> {v.motorista_nome || 'N/A'}</p> {/* Exibe o nome do motorista */}
                  <p className="mb-1"><strong className="text-red-400">Rota:</strong> {v.origem || 'N/A'} <span className="text-red-400 font-bold">➔</span> {v.destino || 'N/A'}</p> {/* Exibe a rota */}
                  <p className="mb-1"><strong className="text-red-400">Início:</strong> {v.inicio}</p>
                  <p><strong className="text-red-400">Status:</strong> {v.status}</p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                  <button
                    onClick={() => handleEditar(v)}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-700 transition duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleFinalizar(v.id)}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-neutral-700 transition duration-300"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !erro && <p className="text-center text-gray-400 mt-6">Nenhuma viagem ativa encontrada.</p>
        )}

        {edicao && (
          <div className="mt-8 p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700 text-gray-100">
            <h3 className="text-xl font-bold mb-4 text-red-500">Editando Viagem: {edicao.placa}</h3>
            
            <div className="mb-4">
              <label htmlFor="placa-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Placa:</label>
              <input
                type="text"
                id="placa-edicao"
                placeholder="Placa"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.placa}
                onChange={e => setEdicao({ ...edicao, placa: e.target.value })}
                disabled // Placa geralmente não deve ser editada
              />
            </div>

            {/* Motorista para Edição */}
            <div className="mb-4">
              <label htmlFor="motorista-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Motorista:</label>
              <select
                id="motorista-edicao"
                name="motorista_id"
                value={edicao.motorista_id}
                onChange={e => setEdicao({ ...edicao, motorista_id: e.target.value })}
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                required
              >
                <option value="">Selecione o Motorista</option>
                {motoristas.map((motorista) => (
                  <option key={motorista.id} value={motorista.id}>
                    {motorista.nome} ({motorista.cnh})
                  </option>
                ))}
              </select>
              {motoristas.length === 0 && (
                <p className="text-sm text-yellow-500 mt-2">Nenhum motorista disponível. Cadastre motoristas primeiro.</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="inicio-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Início:</label>
              <input
                type="date"
                id="inicio-edicao"
                placeholder="Início"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.inicio}
                onChange={e => setEdicao({ ...edicao, inicio: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="fim-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Fim:</label>
              <input
                type="date"
                id="fim-edicao"
                placeholder="Fim"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.fim}
                onChange={e => setEdicao({ ...edicao, fim: e.target.value })}
              />
            </div>

            {/* Origem para Edição */}
            <div className="mb-4">
              <label htmlFor="origem-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Origem:</label>
              <input
                type="text"
                id="origem-edicao"
                placeholder="Origem"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.origem}
                onChange={e => setEdicao({ ...edicao, origem: e.target.value })}
                required
              />
            </div>

            {/* Destino para Edição */}
            <div className="mb-4">
              <label htmlFor="destino-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Destino:</label>
              <input
                type="text"
                id="destino-edicao"
                placeholder="Destino"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.destino}
                onChange={e => setEdicao({ ...edicao, destino: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="frete-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Frete (R$):</label>
              <input
                type="number"
                id="frete-edicao"
                placeholder="Frete (R$)"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.frete}
                onChange={e => setEdicao({ ...edicao, frete: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="lucro-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Lucro Total (R$):</label>
              <input
                type="number"
                id="lucro-edicao"
                placeholder="Lucro Total (R$)"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.lucro_total}
                onChange={e => setEdicao({ ...edicao, lucro_total: e.target.value })}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="status-edicao" className="block text-gray-200 text-sm font-semibold mb-2">Status:</label>
              <select
                id="status-edicao"
                className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                value={edicao.status}
                onChange={e => setEdicao({ ...edicao, status: e.target.value })}
              >
                <option value="Em andamento">Em andamento</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
            
            <button
              onClick={handleSalvar}
              className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition duration-300 transform hover:scale-105"
            >
              Salvar Alterações
            </button>
            <button
                onClick={() => setEdicao(null)} // Cancel editing
                className="w-full mt-4 bg-gray-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition duration-300 transform hover:scale-105"
              >
                Cancelar Edição
              </button>
          </div>
        )}

        {/* Modal de confirmação de salvar */}
        {modalSalvar && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-neutral-800 p-8 rounded-lg shadow-2xl border border-red-700 max-w-sm w-full text-gray-100">
              <h2 className="text-2xl font-semibold mb-4 text-red-500">Confirmar Edição</h2>
              <p className="mb-6">Tem certeza que deseja salvar as alterações?</p>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
                  onClick={() => setModalSalvar(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                  onClick={confirmarSalvar}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmação de finalização */}
        {modalFinalizar.aberto && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-neutral-800 p-8 rounded-lg shadow-2xl border border-red-700 max-w-sm w-full text-gray-100">
              <h2 className="text-2xl font-semibold mb-4 text-red-500">Finalizar Viagem</h2>
              <p className="mb-6">Deseja realmente finalizar esta viagem?</p>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
                  onClick={() => setModalFinalizar({ aberto: false, id: null })}
                >
                  Cancelar
                </button>
                <button
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                  onClick={confirmarFinalizar}
                >
                  Confirmar Finalização
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditarViagem;
