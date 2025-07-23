const { Pool } = require('pg');

// Configuração da conexão com o banco de dados PostgreSQL do Supabase
// ATENÇÃO: Substitua 'SUA_STRING_DE_CONEXAO_DO_SUPABASE' pela sua string real.
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.jbahjvyumllenphhavvv:brototransportadora@aws-0-sa-east-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('Conectado ao banco de dados PostgreSQL com sucesso!');

    // Criação da tabela de caminhões
    await client.query(`
      CREATE TABLE IF NOT EXISTS caminhoes (
        id SERIAL PRIMARY KEY,
        placa VARCHAR(10) NOT NULL UNIQUE,
        nome TEXT,
        status_atual VARCHAR(50) DEFAULT 'Disponível'
      );
    `);
    console.log('Tabela "caminhoes" verificada/criada.');

    // Criação da tabela de motoristas
    await client.query(`
      CREATE TABLE IF NOT EXISTS motoristas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        telefone VARCHAR(20)
      );
    `);
    console.log('Tabela "motoristas" verificada/criada.');

    // Criação da tabela de clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT,
        email TEXT UNIQUE,
        endereco TEXT
      );
    `);
    console.log('Tabela "clientes" verificada/criada.');

    // Tabela de viagens (com nova coluna para custos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS viagens (
        id SERIAL PRIMARY KEY,
        caminhao_id INTEGER REFERENCES caminhoes(id),
        motorista_id INTEGER REFERENCES motoristas(id),
        cliente_id INTEGER REFERENCES clientes(id),
        inicio TEXT,
        fim TEXT,
        origem VARCHAR(255),
        destino VARCHAR(255),
        frete REAL,
        custos REAL DEFAULT 0, -- NOVA COLUNA: Custos
        lucro_total REAL,     -- Será calculado no final
        data_termino TEXT,
        status VARCHAR(50)
      );
    `);
    console.log('Tabela "viagens" verificada/criada.');

    client.release();
  } catch (err) {
    console.error('Erro ao conectar ou inicializar o banco de dados:', err);
    process.exit(1);
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase
};

initializeDatabase();
