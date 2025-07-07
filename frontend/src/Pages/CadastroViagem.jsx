import { useState, useEffect } from "react";
import axios from "axios";

const CadastroViagem = () => {
  const [placas, setPlacas] = useState([]);
  const [motoristas, setMotoristas] = useState([]); // Novo estado para motoristas
  const [form, setForm] = useState({
    placa: "",
    motorista_id: "", // Novo campo
    inicio: "",
    fim: "",
    origem: "",       // Novo campo
    destino: "",      // Novo campo
    frete: "",
    lucro_total: "",
    status: "Em andamento", // Default status
    data_termino: "" // This might be set later if the trip is concluded
  });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    // Carregar placas de caminhões
    axios.get("http://localhost:3001/caminhoes")
      .then(res => setPlacas(res.data))
      .catch((error) => {
        console.error("Erro ao buscar placas de caminhões:", error);
        setErro("Erro ao carregar placas de caminhões.");
        setPlacas([]);
      });

    // Carregar motoristas
    axios.get("http://localhost:3001/motoristas") // Nova requisição para motoristas
      .then(res => setMotoristas(res.data))
      .catch((error) => {
        console.error("Erro ao buscar motoristas:", error);
        setErro(prev => prev + " Erro ao carregar motoristas."); // Adiciona ao erro existente
        setMotoristas([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cadastrar = async (event) => {
    event.preventDefault();

    setMensagem("");
    setErro("");

    try {
      // Enviar todos os dados do formulário, incluindo motorista_id, origem e destino
      await axios.post("http://localhost:3001/viagens", form);
      setMensagem("Viagem cadastrada com sucesso!");
      setForm({
        placa: "",
        motorista_id: "",
        inicio: "",
        fim: "",
        origem: "",
        destino: "",
        frete: "",
        lucro_total: "",
        status: "Em andamento",
        data_termino: ""
      }); // Reset form
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.erro || "Erro ao cadastrar viagem. Tente novamente.");
      } else if (error.request) {
        setErro("Erro de conexão com o servidor. Verifique se o backend está rodando.");
      } else {
        setErro("Erro desconhecido ao tentar cadastrar. Tente novamente.");
      }
      console.error("Erro ao cadastrar viagem:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter">
      <div className="max-w-md w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700">
        <h2 className="text-3xl font-bold mb-6 text-red-500 text-center">Cadastro de Viagem</h2>

        <form onSubmit={cadastrar}>
          {/* Placa */}
          <div className="mb-4">
            <label htmlFor="placa" className="block text-gray-200 text-sm font-semibold mb-2">
              Placa do caminhão:
            </label>
            <select
              id="placa"
              name="placa"
              value={form.placa}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              required
            >
              <option value="">Selecione a Placa</option>
              {placas.map((caminhao) => (
                <option key={caminhao.id} value={caminhao.placa}>
                  {caminhao.placa}
                </option>
              ))}
            </select>
            {placas.length === 0 && !erro && (
              <p className="text-sm text-yellow-500 mt-2">Nenhuma placa disponível. Cadastre caminhões primeiro.</p>
            )}
          </div>

          {/* Motorista */}
          <div className="mb-4">
            <label htmlFor="motorista_id" className="block text-gray-200 text-sm font-semibold mb-2">
              Motorista:
            </label>
            <select
              id="motorista_id"
              name="motorista_id"
              value={form.motorista_id}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              required
            >
              <option value="">Selecione o Motorista</option>
              {motoristas.map((motorista) => (
                <option key={motorista.id} value={motorista.id}>
                  {motorista.nome} ({motorista.cnh})
                </option>
              ))}
            </select>
            {motoristas.length === 0 && !erro && (
              <p className="text-sm text-yellow-500 mt-2">Nenhum motorista disponível. Cadastre motoristas primeiro.</p>
            )}
          </div>

          {/* Data Início */}
          <div className="mb-4">
            <label htmlFor="inicio" className="block text-gray-200 text-sm font-semibold mb-2">
              Data Início:
            </label>
            <input
              type="date"
              id="inicio"
              name="inicio"
              value={form.inicio}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              required
            />
          </div>

          {/* Data Fim */}
          <div className="mb-4">
            <label htmlFor="fim" className="block text-gray-200 text-sm font-semibold mb-2">
              Data Fim:
            </label>
            <input
              type="date"
              id="fim"
              name="fim"
              value={form.fim}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              required
            />
          </div>

          {/* Origem */}
          <div className="mb-4">
            <label htmlFor="origem" className="block text-gray-200 text-sm font-semibold mb-2">
              Origem:
            </label>
            <input
              type="text"
              id="origem"
              name="origem"
              value={form.origem}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              placeholder="Ex: Curitiba"
              required
            />
          </div>

          {/* Destino */}
          <div className="mb-4">
            <label htmlFor="destino" className="block text-gray-200 text-sm font-semibold mb-2">
              Destino:
            </label>
            <input
              type="text"
              id="destino"
              name="destino"
              value={form.destino}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              placeholder="Ex: Acre"
              required
            />
          </div>

          {/* Valor do Frete */}
          <div className="mb-4">
            <label htmlFor="frete" className="block text-gray-200 text-sm font-semibold mb-2">
              Valor do Frete:
            </label>
            <input
              type="number"
              id="frete"
              name="frete"
              value={form.frete}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              placeholder="Ex: 5000"
              required
            />
          </div>

          {/* Lucro Total */}
          <div className="mb-6">
            <label htmlFor="lucro_total" className="block text-gray-200 text-sm font-semibold mb-2">
              Lucro Total:
            </label>
            <input
              type="number"
              id="lucro_total"
              name="lucro_total"
              value={form.lucro_total}
              onChange={handleChange}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              placeholder="Ex: 1500"
              required
            />
          </div>

          {/* Botão Cadastrar */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition duration-300 transform hover:scale-105"
          >
            Cadastrar Viagem
          </button>
        </form>

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
      </div>
    </div>
  );
};

export default CadastroViagem;
