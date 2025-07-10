// database.js
const { Pool } = require('pg'); // Importa o módulo Pool do driver pg

// Configuração da conexão com o banco de dados PostgreSQL do Supabase
// ATENÇÃO: Substitua 'SUA_STRING_DE_CONEXAO_DO_SUPABASE' pela sua string real.
// Exemplo: 'postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres'
const connectionString = process.env.DATABASE_URL || 'SUA_STRING_DE_CONEXAO_DO_SUPABASE';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Função para testar a conexão e criar as tabelas
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('Conectado ao banco de dados PostgreSQL com sucesso!');

    // Criação da tabela de caminhões
    await client.query(`
      CREATE TABLE IF NOT EXISTS caminhoes (
        id SERIAL PRIMARY KEY,
        placa VARCHAR(10) NOT NULL UNIQUE,
        status_atual VARCHAR(50) DEFAULT 'Disponível'
      );
    `);
    console.log('Tabela "caminhoes" verificada/creada.');

    // Criação da tabela de motoristas - CNH REMOVIDA
    await client.query(`
      CREATE TABLE IF NOT EXISTS motoristas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        telefone VARCHAR(20)
      );
    `);
    console.log('Tabela "motoristas" verificada/creada.');

    // Criação da tabela de viagens
    await client.query(`
      CREATE TABLE IF NOT EXISTS viagens (
        id SERIAL PRIMARY KEY,
        caminhao_id INTEGER REFERENCES caminhoes(id),
        motorista_id INTEGER REFERENCES motoristas(id),
        inicio TEXT,
        fim TEXT,
        origem VARCHAR(255),
        destino VARCHAR(255),
        frete REAL,
        lucro_total REAL,
        data_termino TEXT,
        status VARCHAR(50)
      );
    `);
    console.log('Tabela "viagens" verificada/creada.');

    client.release(); // Libera o cliente de volta para o pool
  } catch (err) {
    console.error('Erro ao conectar ou inicializar o banco de dados:', err);
    process.exit(1);
  }
}

// Exporta o pool para que outras partes da aplicação possam executar queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase
};

initializeDatabase();
