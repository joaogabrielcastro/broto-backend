import { useState } from "react";
import axios from "axios"; // Make sure axios is installed (npm install axios)

const CadastroCaminhao = () => {
  const [placa, setPlaca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(""); // State for errors

  const cadastrar = async () => {
    setMensagem(""); // Clear previous success messages
    setErro("");     // Clear previous error messages

    try {
      // Correction here: The route must be '/caminhoes' (plural) as per the backend
      await axios.post("http://localhost:3001/caminhoes", { placa });
      setMensagem("Caminhão cadastrado com sucesso!");
      setPlaca(""); // Clear the plate input field
    } catch (error) {
      // Better error handling to display more useful messages
      if (error.response) {
        // The server responded with an error status (e.g., 404, 500)
        setErro(error.response.data.erro || "Erro ao cadastrar. Tente novamente.");
      } else if (error.request) {
        // The request was made, but no response was received from the server
        setErro("Erro de conexão com o servidor. Verifique se o backend está rodando.");
      } else {
        // Something else caused the error in request setup
        setErro("Erro desconhecido ao tentar cadastrar. Tente novamente.");
      }
      console.error("Error registering truck:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-inter"> {/* Full screen dark background, centered, Inter font */}
      <div className="max-w-md w-full p-8 bg-neutral-800 rounded-lg shadow-2xl border border-red-700"> {/* Darker card with red border, larger shadow */}
        <h2 className="text-3xl font-bold mb-6 text-red-500 text-center">Cadastro de Caminhão</h2> {/* Red title, bold, centered */}
        
        <form onSubmit={(e) => { e.preventDefault(); cadastrar(); }}> {/* Added form and onSubmit to prevent default submit */}
          <div className="mb-4">
            <label htmlFor="placa" className="block text-gray-200 text-sm font-semibold mb-2">
              Placa do caminhão:
            </label>
            <input
              type="text"
              id="placa"
              placeholder="Ex: ABC1234"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="w-full p-3 border border-red-700 rounded-md bg-neutral-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300"
              required // Added required attribute
            />
          </div>
          
          <button
            type="submit" // Changed to type="submit" for form submission
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition duration-300 transform hover:scale-105"
          >
            Cadastrar
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

export default CadastroCaminhao;
