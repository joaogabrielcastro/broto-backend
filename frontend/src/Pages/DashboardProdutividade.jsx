import { useEffect, useState } from "react";
import axios from "axios";

const DashboardProdutividade = () => {
  const [dados, setDados] = useState([]);
  const [erro, setErro] = useState(""); // Adicionado estado para erros
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    setLoading(true);
    setErro(""); // Clear any previous errors on mount

    axios
      .get("http://localhost:3001/produtividade")
      .then((res) => {
        setDados(res.data);
        if (res.data.length === 0) {
          setErro("Nenhum dado de produtividade encontrado.");
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar dados de produtividade:", error);
        setErro(
          "Erro ao carregar dados de produtividade. Tente novamente mais tarde."
        );
        setDados([]); // Clear data on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter py-8">
      {" "}
      {/* Full screen dark background, centered, with vertical padding */}
      <div className="max-w-xl w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700">
        {" "}
        {/* Darker card with red border, larger shadow */}
        <h2 className="text-3xl font-bold mb-8 text-red-500 text-center">
          Dashboard de Produtividade
        </h2>{" "}
        {/* Red title, bold, centered */}
        {erro && (
          <p className="mb-6 text-center text-red-400 bg-red-900 bg-opacity-30 border border-red-700 rounded-md p-3">
            {erro}
          </p>
        )}
        {loading ? (
          <p className="text-center text-gray-400 mt-6">
            Carregando dados de produtividade...
          </p>
        ) : dados.length > 0 ? (
          <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {" "}
            {/* Added scroll for many items */}
            {dados.map((item, index) => (
              <div
                key={item.placa + item.data_termino || index} // More unique key using placa and data_termino
                className={`p-5 rounded-lg shadow-md transition-all duration-300 transform hover:scale-102
                  ${
                    item.status === "Lucro"
                      ? "bg-green-800 border-green-600 text-green-100" // Green for profit
                      : "bg-red-800 border-red-600 text-red-100" // Red for loss
                  } border`}
              >
                <p className="text-lg font-semibold mb-2">
                  <strong className="text-gray-200">Placa:</strong> {item.placa}
                </p>
                <p className="mb-1">
                  <strong className="text-gray-200">Motorista:</strong>{" "}
                  <span className="text-amber-400 font-bold">
                    {item.motorista_nome || "N/A"}
                  </span>
                </p>{" "}
                {/* NOVO CAMPO */}
                <p className="mb-1">
                  <strong className="text-gray-200">Rota:</strong>{" "}
                  <span className="text-gray-300">{item.origem || "N/A"}</span>{" "}
                  <span className="text-red-400 font-bold">➔</span>{" "}
                  <span className="text-gray-300">{item.destino || "N/A"}</span>
                </p>{" "}
                {/* NOVOS CAMPOS */}
                <p className="mb-1">
                  <strong className="text-gray-200">
                    Lucro/Prejuízo Total:
                  </strong>{" "}
                  R$ {parseFloat(item.lucro_total).toFixed(2)}
                </p>{" "}
                {/* Format currency */}
                <p className="mb-1">
                  <strong className="text-gray-200">Status:</strong>{" "}
                  <span
                    className={`font-bold ${
                      item.status === "Lucro"
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-200">Data Término:</strong>{" "}
                  {item.data_termino}
                </p>
              </div>
            ))}
          </div>
        ) : (
          !erro && (
            <p className="text-center text-gray-400 mt-6">
              Nenhum dado de produtividade disponível.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default DashboardProdutividade;
