import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Make sure jspdf-autotable is installed

const ExportarDados = () => {
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
          setError("Nenhuma viagem finalizada encontrada para exportação.");
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar viagens finalizadas:", err);
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const exportarExcel = () => {
    if (viagens.length === 0) {
      setError("Não há dados de viagens para exportar para Excel.");
      return;
    }
    setError(""); // Clear error if export proceeds

    try {
      const ws = XLSX.utils.json_to_sheet(viagens.map(v => ({
        Placa: v.placa,
        "Data Fim": v.fim,
        "Lucro Total (R$)": parseFloat(v.lucro_total).toFixed(2), // Ensure number format
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Viagens Finalizadas");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "viagens_finalizadas.xlsx");
      alert("Arquivo Excel exportado com sucesso!"); // Using alert for success, as it's a file download
    } catch (e) {
      console.error("Erro ao exportar para Excel:", e);
      setError("Erro ao exportar para Excel. Verifique o console.");
    }
  };

  const exportarPDF = () => {
    if (viagens.length === 0) {
      setError("Não há dados de viagens para exportar para PDF.");
      return;
    }
    setError(""); // Clear error if export proceeds

    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold"); // Set font and bold for title
      doc.setTextColor(255, 70, 70); // Red title color
      doc.setFontSize(18);
      doc.text("Relatório de Viagens Finalizadas", 14, 20);

      const dadosTabela = viagens.map((v) => [
        v.placa,
        v.fim,
        `R$ ${Number(v.lucro_total).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ]);

      autoTable(doc, {
        head: [["Placa", "Data Fim", "Lucro Total"]],
        body: dadosTabela,
        startY: 30, // Adjust startY to leave space for the title
        headStyles: {
          fillColor: [153, 0, 0], // Dark red for table header
          textColor: [255, 255, 255], // White text for header
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [34, 34, 34] }, // Dark background for alternating rows
        bodyStyles: { textColor: [200, 200, 200], fillColor: [42, 42, 42] }, // Light gray text, slightly darker background for body
        styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 3,
        },
        columnStyles: { // Aligning columns
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
        }
      });

      doc.save("relatorio_viagens_finalizadas.pdf");
      alert("Arquivo PDF exportado com sucesso!"); // Using alert for success, as it's a file download
    } catch (e) {
      console.error("Erro ao exportar para PDF:", e);
      setError("Erro ao exportar para PDF. Verifique o console.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter py-8">
      <div className="max-w-4xl w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700">
        <h2 className="text-3xl font-bold mb-8 text-red-500 text-center">Exportar Viagens Finalizadas</h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center"> {/* Centered buttons */}
          <button
            onClick={exportarExcel}
            className="flex items-center justify-center bg-red-600 text-white font-bold py-3 px-6 rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            Exportar Excel
          </button>
          <button
            onClick={exportarPDF}
            className="flex items-center justify-center bg-red-600 text-white font-bold py-3 px-6 rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-4.5-4.5V9.5a.5.5 0 011 0v3A3.5 3.5 0 005.5 16h9A3.5 3.5 0 0018 12.5v-3a.5.5 0 011 0v3A4.5 4.5 0 0114.5 17h-9zM4.707 9.293a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V14a1 1 0 11-2 0V7.414L5.414 9.293a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
            Exportar PDF
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 mt-6">Carregando viagens finalizadas...</p>
        ) : error ? (
          <p className="text-center text-red-400 bg-red-900 bg-opacity-30 border border-red-700 rounded-md p-3">
            {error}
          </p>
        ) : viagens.length > 0 ? (
          <div className="max-h-96 overflow-y-auto pr-2"> {/* Added scroll for many items */}
            <ul className="space-y-3">
              {viagens.map((v) => (
                <li
                  key={v.id}
                  className="bg-neutral-700 border border-red-600 p-4 rounded-lg shadow-md text-gray-100 flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-semibold"><strong className="text-red-400">Placa:</strong> {v.placa}</p>
                    <p className="text-sm"><strong className="text-red-400">Data Fim:</strong> {v.fim}</p>
                  </div>
                  <span className="text-green-400 font-bold text-lg">
                    R$ {Number(v.lucro_total).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-6">Nenhuma viagem finalizada encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default ExportarDados;
