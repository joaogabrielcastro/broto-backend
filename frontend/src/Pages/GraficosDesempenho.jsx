import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const GraficosDesempenho = () => {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState("");     // Added error state

  useEffect(() => {
    setLoading(true);
    setError(""); // Clear previous errors
    axios.get("http://localhost:3001/viagens/finalizadas")
      .then(res => {
        setViagens(res.data);
        if (res.data.length === 0) {
          setError("Nenhum dado de viagem finalizada encontrado para exibir gráficos.");
        }
      })
      .catch(err => {
        console.error("Erro ao buscar viagens finalizadas para gráficos:", err);
        setError("Erro ao carregar dados dos gráficos. Tente novamente mais tarde.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Agrupa viagens por placa e garante o formato de dados para o gráfico
  const viagensPorPlaca = viagens.reduce((acc, viagem) => {
    if (!acc[viagem.placa]) acc[viagem.placa] = [];
    acc[viagem.placa].push({
      data: viagem.fim, // Use a data de fim para o eixo X
      lucro: Number(viagem.lucro_total), // Garante que lucro é um número
    });
    return acc;
  }, {});

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter py-8">
      <div className="max-w-6xl w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700">
        <h2 className="text-3xl font-bold mb-8 text-red-500 text-center">Desempenho por Caminhão (Gráficos)</h2>

        {loading ? (
          <p className="text-center text-gray-400 mt-6">Carregando dados dos gráficos...</p>
        ) : error ? (
          <p className="text-center text-red-400 bg-red-900 bg-opacity-30 border border-red-700 rounded-md p-3">
            {error}
          </p>
        ) : Object.keys(viagensPorPlaca).length > 0 ? (
          <div className="space-y-10"> {/* More space between charts */}
            {Object.entries(viagensPorPlaca).map(([placa, dados]) => (
              <div key={placa} className="bg-neutral-700 rounded-lg p-6 shadow-xl border border-red-600"> {/* Darker background for each chart card */}
                <h3 className="text-2xl font-bold mb-4 text-gray-100 text-center">Placa: <span className="text-red-400">{placa}</span></h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" /> {/* Lighter gray grid */}
                    <XAxis dataKey="data" stroke="#ccc" tick={{ fill: '#ccc' }} /> {/* Light gray for axis */}
                    <YAxis stroke="#ccc" tick={{ fill: '#ccc' }} /> {/* Light gray for axis */}
                    <Tooltip
                      contentStyle={{ backgroundColor: '#333', border: '1px solid #666', color: '#eee' }} // Dark tooltip style
                      labelStyle={{ color: '#ccc' }}
                      itemStyle={{ color: '#eee' }}
                    />
                    <Legend wrapperStyle={{ color: '#eee' }} /> {/* Light gray legend text */}
                    <ReferenceLine y={30000} stroke="#ff3333" strokeDasharray="3 3" label={{ value: "Meta Mínima R$30.000", position: "insideTopRight", fill: "#ff3333" }} /> {/* Red reference line */}
                    <Line
                      type="monotone"
                      dataKey="lucro"
                      // stroke="#8884d8" // Original blue-ish, but let's make it a contrasting color, or keep for clarity.
                      // Using a light blue/purple that stands out on dark, or a specific shade of red/orange
                      // For consistency, let's use a contrasting accent that works with red/black.
                      // A blue is often good for line charts to distinguish.
                      // stroke="#6366f1" // Tailwind indigo-500
                      // stroke="#3b82f6" // Tailwind blue-500
                      // Alternatively, a light orange/gold:
                      stroke="#fbbf24" // Tailwind amber-400 for contrast
                      name="Lucro (R$)"
                      activeDot={{ r: 8 }}
                      dot={{ r: 4, fill: '#fbbf24' }} // Match dot color
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        ) : (
          !error && <p className="text-center text-gray-400 mt-6">Nenhum gráfico de desempenho disponível.</p>
        )}
      </div>
    </div>
  );
};

export default GraficosDesempenho;
