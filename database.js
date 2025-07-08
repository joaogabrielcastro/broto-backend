// database.js
const { Pool } = require('pg'); // Importa o módulo Pool do driver pg

// Configuração da conexão com o banco de dados PostgreSQL do Supabase
// ATENÇÃO: SUBSTITUÍDO 'SUA_STRING_DE_CONEXAO_DO_SUPABASE' pela sua string real.
const connectionString = process.env.DATABASE_URL || "postgresql://postgres.jbahjvyumllenphhavvv:brototransportadora@aws-0-sa-east-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    // Para ambientes de produção (como Render), é importante usar SSL
    // O Supabase exige SSL
    rejectUnauthorized: false // Pode ser true se você tiver um certificado CA, mas false é comum para começar
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
    console.log('Tabela "caminhoes" verificada/criada.');

    // Criação da tabela de motoristas
    await client.query(`
      CREATE TABLE IF NOT EXISTS motoristas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE,
        cnh VARCHAR(20) UNIQUE,
        telefone VARCHAR(20)
      );
    `);
    console.log('Tabela "motoristas" verificada/criada.');

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
    console.log('Tabela "viagens" verificada/criada.');

    client.release(); // Libera o cliente de volta para o pool
  } catch (err) {
    console.error('Erro ao conectar ou inicializar o banco de dados:', err);
    // Em um ambiente de produção, você pode querer encerrar o processo aqui
    process.exit(1);
  }
}

// Exporta o pool para que outras partes da aplicação possam executar queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase // Exporta a função de inicialização
};

// Chama a função de inicialização ao carregar o módulo
initializeDatabase();
