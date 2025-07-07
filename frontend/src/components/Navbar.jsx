import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const linkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-md transition duration-300 ease-in-out font-semibold text-lg whitespace-nowrap
     ${isActive
       ? 'bg-red-700 text-white shadow-lg'
       : 'text-gray-300 hover:text-red-400 hover:bg-neutral-700'
     }`;

  return (
    <nav className="bg-neutral-800 p-4 shadow-xl border-b-2 border-red-700 font-inter sticky top-0 z-40">
      <div className="container mx-auto flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
        <NavLink to="/" className={linkClasses}>
          Consulta
        </NavLink>
        <NavLink to="/produtividade" className={linkClasses}>
          Produtividade
        </NavLink>
        <NavLink to="/situacao" className={linkClasses}>
          Situação Atual
        </NavLink>
        <NavLink to="/cadastro" className={linkClasses}>
          Cadastrar Caminhão
        </NavLink>
        <NavLink to="/cadastrar-motorista" className={linkClasses}> {/* NOVO LINK */}
          Cadastrar Motorista
        </NavLink>
        <NavLink to="/cadastrar-viagem" className={linkClasses}>
          Cadastrar Viagem
        </NavLink>
        <NavLink to="/resumo" className={linkClasses}>
          Resumo Financeiro
        </NavLink>
        <NavLink to="/editar" className={linkClasses}>
          Editar Viagens
        </NavLink>
        <NavLink to="/graficos" className={linkClasses}>
          Gráficos
        </NavLink>
        <NavLink to="/exportar" className={linkClasses}>
          Exportar Dados
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
