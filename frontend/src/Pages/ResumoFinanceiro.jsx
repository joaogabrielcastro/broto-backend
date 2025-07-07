import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ResumoFinanceiro = () => {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState("");     // Added error state

  useEffect(() => {
    setLoading(true);
    setError(""); // Clear previous errors
    // CORREÇÃO AQUI: Alterado o endpoint de "/viagens" para "/viagens/finalizadas"
    // Isso garante que o componente chame a rota correta no backend
    axios.get("http://localhost:3001/viagens/finalizadas")
      .then(res => {
        // Filtra dados para garantir que temos o mínimo necessário antes de usar
        const filteredViagens = res.data.filter(v => v.lucro_total !== null && v.lucro_total !== undefined);
        setViagens(filteredViagens);
        if (filteredViagens.length === 0) {
          setError("Nenhuma viagem com lucro/prejuízo registrado encontrada.");
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar viagens para resumo financeiro:", err);
        setError("Erro ao carregar dados do resumo financeiro. Tente novamente mais tarde.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const data = {
    labels: viagens.map((v) => `${v.placa} - ${v.fim || 'N/A'}`), // Added N/A for cases where fim might be missing
    datasets: [
      {
        label: "Lucro Total (R$)",
        data: viagens.map((v) => Number(v.lucro_total)), // Ensure data is numerical
        backgroundColor: viagens.map(v => Number(v.lucro_total) >= 30000 ? "#22c55e" : "#ef4444"), // Tailwind green-500 or red-500
        borderColor: viagens.map(v => Number(v.lucro_total) >= 30000 ? "#16a34a" : "#dc2626"), // Darker green/red for border
        borderWidth: 1,
        borderRadius: 5, // Rounded corners for bars
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill the container height
    plugins: {
      legend: {
        display: true, // Display legend to show what the bars represent
        position: 'top',
        labels: {
          color: '#e0e0e0', // Light gray color for legend text
        }
      },
      tooltip: {
        backgroundColor: '#333', // Dark tooltip background
        titleColor: '#e0e0e0', // Light gray title color
        bodyColor: '#e0e0e0', // Light gray body color
        borderColor: '#555', // Border for tooltip
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `R$ ${parseFloat(ctx.raw).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#e0e0e0', // Light gray for X-axis labels
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Subtle white grid lines
          borderColor: '#e0e0e0', // Light gray border
        },
        title: {
          display: true,
          text: "Viagens (Placa - Data Fim)",
          color: '#e0e0e0', // Light gray title color
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#e0e0e0', // Light gray for Y-axis labels
          callback: (value) => `R$ ${value.toLocaleString("pt-BR")}` // Format Y-axis labels as currency
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // Subtle white grid lines
          borderColor: '#e0e0e0', // Light gray border
        },
        title: {
          display: true,
          text: "Lucro (R$)",
          color: '#e0e0e0', // Light gray title color
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter py-8">
      <div className="max-w-4xl w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700">
        <h2 className="text-3xl font-bold mb-8 text-red-500 text-center">Resumo Financeiro (Viagens Finalizadas)</h2>
        
        {loading ? (
          <p className="text-center text-gray-400 mt-6">Carregando dados do resumo financeiro...</p>
        ) : error ? (
          <p className="text-center text-red-400 bg-red-900 bg-opacity-30 border border-red-700 rounded-md p-3">
            {error}
          </p>
        ) : viagens.length > 0 ? (
          <div className="h-96 w-full"> {/* Fixed height for chart container */}
            <Bar data={data} options={options} />
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-6">Nenhuma viagem com lucro/prejuízo registrado para exibir o resumo financeiro.</p>
        )}
      </div>
    </div>
  );
};

export default ResumoFinanceiro;
