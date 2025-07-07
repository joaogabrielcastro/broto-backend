import { useState } from "react";
import axios from "axios";

const ConsultaPelaPlaca = () => {
  const [placa, setPlaca] = useState("");
  const [viagens, setViagens] = useState([]);
  const [mensagem, setMensagem] = useState(""); // For success messages
  const [erro, setErro] = useState("");         // For error messages
  const [loading, setLoading] = useState(false); // Loading state for search

  const buscarViagens = async () => {
    setViagens([]);   // Clear previous results
    setMensagem(""); // Clear messages
    setErro("");     // Clear errors
    setLoading(true); // Start loading

    if (!placa) {
      setErro("Por favor, digite uma placa para buscar.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3001/viagens/${placa}`);
      
      // A API retorna { placa, viagens: [] } se não encontrar o caminhão,
      // ou { placa, viagens: [...] } se encontrar.
      if (res.data && res.data.viagens && res.data.viagens.length > 0) {
        setViagens(res.data.viagens);
        setMensagem(`Viagens encontradas para a placa: ${placa}`);
      } else {
        setViagens([]); // Ensure no old data is shown
        setErro("Caminhão não encontrado ou não possui viagens cadastradas.");
      }
    } catch (error) {
      console.error("Erro ao buscar viagens:", error);
      if (error.response && error.response.status === 404) {
        setErro("Caminhão não encontrado. Verifique a placa digitada.");
      } else if (error.request) {
        setErro("Erro de conexão com o servidor. Verifique se o backend está rodando.");
      } else {
        setErro("Erro ao buscar viagens. Tente novamente mais tarde.");
      }
      setViagens([]); // Clear any previous results on error
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter"> {/* Full screen dark background, centered, Inter font */}
      <div className="max-w-md w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700"> {/* Darker card with red border, larger shadow */}
        <h2 className="text-3xl font-bold mb-6 text-red-500 text-center">Consulta por Placa</h2> {/* Red title, bold, centered */}
        
        <div className="mb-4">
          <label htmlFor="placa" className="block text-gray-200 text-sm font-semibold mb-2">
            Digite a placa do caminhão:
          </label>
          <input
            type="text"
            id="placa"
            placeholder="Ex: ABC1234"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
            required
          />
        </div>
        
        <button
          onClick={buscarViagens}
          className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition duration-300 transform hover:scale-105"
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Buscando...' : 'Buscar Viagens'}
        </button>

        {mensagem && (
          <p className="mt-6 text-center text-green-400 bg-green-900 bg-opacity-30 border border-green-700 rounded-md p-3">
            {mensagem}
          </p>
        )}
        {erro && (
          <p className="mt-6 text-center text-red-400 bg-red-900 bg-opacity-30 border border-red-700 rounded-md p-3">
            {erro}
          </p>
        )}

        {viagens.length > 0 && (
          <div className="mt-8 space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added scroll for many trips */}
            {viagens.map((v) => (
              <div
                key={v.id}
                className="bg-neutral-700 border border-red-600 p-4 rounded-lg shadow-md text-gray-100" // Darker card for each trip
              >
                <p className="mb-1"><strong><span className="text-red-400">Motorista:</span></strong> {v.motorista_nome || 'N/A'}</p> {/* NOVO CAMPO */}
                <p className="mb-1"><strong><span className="text-red-400">Rota:</span></strong> {v.origem || 'N/A'} <span className="text-red-400 font-bold">➔</span> {v.destino || 'N/A'}</p> {/* NOVOS CAMPOS */}
                <p className="mb-1"><strong><span className="text-red-400">Início:</span></strong> {v.inicio}</p>
                <p className="mb-1"><strong><span className="text-red-400">Fim:</span></strong> {v.fim}</p>
                <p className="mb-1"><strong><span className="text-red-400">Frete:</span></strong> R$ {v.frete}</p>
                <p className="mb-1"><strong><span className="text-red-400">Lucro:</span></strong> R$ {v.lucro_total}</p>
                <p><strong><span className="text-red-400">Status:</span></strong> {v.status}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && viagens.length === 0 && !erro && placa && ( // Show message if no trips found after a search and not loading
          <p className="mt-6 text-center text-gray-400">Nenhuma viagem encontrada para a placa digitada.</p>
        )}
      </div>
    </div>
  );
};

export default ConsultaPelaPlaca;
