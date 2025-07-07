// .eslintrc.js
module.exports = {
  // Define os ambientes onde seu código será executado
  env: {
    browser: true, // Habilita variáveis globais de navegador (ex: window, document)
    node: true,    // Habilita variáveis globais do Node.js (ex: module, require, process)
    es2021: true   // Habilita todas as variáveis globais de ES2021 e define a sintaxe ES2021
  },
  // Conjunto de regras que você quer estender.
  // 'eslint:recommended' são as regras básicas recomendadas pelo ESLint.
  // 'plugin:react/recommended' adiciona regras específicas para React.
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  // Opções para o parser (analisador de código)
  parserOptions: {
    ecmaFeatures: {
      jsx: true // Habilita o parsing de JSX
    },
    ecmaVersion: 'latest', // Permite o uso da sintaxe mais recente do ECMAScript
    sourceType: 'module'   // Permite o uso de módulos ES (import/export)
  },
  // Plugins que fornecem regras adicionais ou funcionalidades.
  // Neste caso, o plugin 'react' é necessário para as regras do React.
  plugins: [
    'react'
  ],
  // Configurações para plugins. Aqui, dizemos ao plugin React para detectar a versão
  // do React automaticamente, para evitar avisos sobre prop-types se não os usar.
  settings: {
    react: {
      version: 'detect' // Detecta automaticamente a versão do React em uso
    }
  },
  // Regras personalizadas ou para sobrescrever as regras padrão
  rules: {
    // Desativa a regra que exige que React esteja no escopo para JSX.
    // Isso é útil para React 17+ onde não é mais necessário importar React explicitamente para usar JSX.
    'react/react-in-jsx-scope': 'off',
    // Desativa a regra que exige validação de prop-types, comum em projetos com TypeScript ou sem validação manual.
    'react/prop-types': 'off',
    // Altera 'no-unused-vars' para um aviso em vez de erro,
    // o que é útil durante o desenvolvimento para variáveis temporariamente não utilizadas.
    'no-unused-vars': 'warn'
  }
};
