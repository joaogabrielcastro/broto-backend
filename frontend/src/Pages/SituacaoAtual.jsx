import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

const SituacaoAtual = () => {
  const [viagens, setViagens] = useState([]);
  const [mensagem, setMensagem] = useState(""); // For success messages
  const [erro, setErro] = useState("");         // For error messages
  const [modalConfirmacao, setModalConfirmacao] = useState({ aberto: false, placa: null });
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    carregarViagens();
  }, []);

  const carregarViagens = () => {
    setLoading(true);
    setMensagem(""); // Clear previous messages
    setErro("");     // Clear previous errors
    axios.get("http://localhost:3001/situacao")
      .then(res => {
        // Filtra dados para garantir que temos o mínimo necessário antes de usar
        const rawData = Array.isArray(res.data) ? res.data : []; 
        const validViagens = rawData.filter(v => v && v.placa && v.inicio && v.status);
        setViagens(validViagens);

        if (validViagens.length === 0) {
          setMensagem("Nenhum caminhão está em viagem no momento.");
        }
      })
      .catch(err => {
        console.error("Erro ao carregar situação atual:", err);
        setErro("Erro ao carregar a situação atual. Tente novamente mais tarde.");
        setViagens([]); // Clear data on error
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFinalizarViagem = (placa) => {
    setModalConfirmacao({ aberto: true, placa });
  };

  const confirmarFinalizarViagem = async () => {
    const placa = modalConfirmacao.placa;
    setModalConfirmacao({ aberto: false, placa: null }); // Close modal immediately
    setMensagem("");
    setErro("");

    try {
      // Primeiro, busca a viagem em andamento para obter o ID
      const res = await axios.get(`http://localhost:3001/viagens/${placa}`);
      const ultima = res.data.viagens.find(v => v.status === "Em andamento");

      if (!ultima || !ultima.id) { // Ensure ultima and its ID exist
        setErro(`Não foi encontrada uma viagem "Em andamento" para a placa ${placa}.`);
        carregarViagens(); // Reload in case status changed
        return;
      }

      // Em seguida, finaliza a viagem usando o ID
      await axios.patch(`http://localhost:3001/viagens/${ultima.id}/finalizar`);
      setMensagem(`Viagem do caminhão ${placa} finalizada com sucesso!`);
      carregarViagens(); // Recarrega a lista para remover a viagem finalizada
    } catch (err) {
      console.error("Erro ao finalizar viagem:", err);
      setErro(err.response?.data?.erro || `Erro ao finalizar a viagem do caminhão ${placa}. Tente novamente.`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter py-8">
      <div className="max-w-4xl w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700">
        <h2 className="text-3xl font-bold mb-8 text-red-500 text-center">Situação Atual dos Caminhões</h2>

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
          <p className="text-center text-gray-400 mt-6">Carregando situação atual...</p>
        ) : viagens.length > 0 ? (
          <div className="grid gap-6 max-h-96 overflow-y-auto pr-2">
            {viagens.map((v, i) => {
              const inicioDayjs = v.inicio ? dayjs(v.inicio) : null;
              const inicioFormatado = inicioDayjs && inicioDayjs.isValid() ? inicioDayjs.format("DD/MM/YYYY") : "Data inválida ou ausente";
              const dias = inicioDayjs && inicioDayjs.isValid() ? dayjs().diff(inicioDayjs, "day") : "N/A";

              return (
                <div 
                  key={v.placa || `situacao-${i}`}
                  className="bg-neutral-700 shadow-xl p-6 rounded-lg border-l-8 border-red-600 text-gray-100 flex flex-col md:flex-row md:justify-between md:items-center transform hover:scale-102 transition duration-300"
                >
                  <div className="mb-4 md:mb-0">
                    <p className="text-2xl font-bold text-red-400 mb-2">🚚 Placa: {v.placa || 'N/A'}</p>
                    <p className="mb-1"><span className="font-semibold text-gray-300">Motorista:</span> <span className="text-amber-400 font-bold">{v.motorista_nome || 'N/A'}</span></p> {/* NOVO CAMPO */}
                    <p className="mb-1"><span className="font-semibold text-gray-300">Rota:</span> <span className="text-gray-300">{v.origem || 'N/A'}</span> <span className="text-red-400 font-bold">➔</span> <span className="text-gray-300">{v.destino || 'N/A'}</span></p> {/* NOVOS CAMPOS */}
                    <p className="mb-1"><span className="font-semibold text-gray-300">Início:</span> {inicioFormatado}</p>
                    <p className="mb-1"><span className="font-semibold text-gray-300">Dias na estrada:</span> <span className="font-bold text-amber-400">{dias} dia(s)</span></p>
                    <p>
                      <span className="font-semibold text-gray-300">Status:</span>{" "}
                      <span className="text-blue-400 font-bold">🔄 Em andamento</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleFinalizarViagem(v.placa)}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-neutral-700 transition duration-300 transform hover:scale-105"
                  >
                    Finalizar Viagem
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          !erro && <p className="text-center text-gray-400 mt-6">Nenhum caminhão está em viagem no momento.</p>
        )}

        {/* Modal de confirmação de finalização */}
        {modalConfirmacao.aberto && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-neutral-800 p-8 rounded-lg shadow-2xl border border-red-700 max-w-sm w-full text-gray-100">
              <h2 className="text-2xl font-semibold mb-4 text-red-500">Finalizar Viagem</h2>
              <p className="mb-6">Deseja realmente finalizar a viagem do caminhão <span className="font-bold text-red-400">{modalConfirmacao.placa}</span>?</p>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
                  onClick={() => setModalConfirmacao({ aberto: false, placa: null })}
                >
                  Cancelar
                </button>
                <button
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                  onClick={confirmarFinalizarViagem}
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

export default SituacaoAtual;
