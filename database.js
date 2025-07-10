    // database.js
    const { Pool } = require('pg');

    // ATENÇÃO: SUBSTITUÍDO PELA SUA STRING DE CONEXÃO REAL DO SUPABASE
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

        await client.query(`
          CREATE TABLE IF NOT EXISTS caminhoes (
            id SERIAL PRIMARY KEY,
            placa VARCHAR(10) NOT NULL UNIQUE,
            status_atual VARCHAR(50) DEFAULT 'Disponível'
          );
        `);
        console.log('Tabela "caminhoes" verificada/criada.');

        await client.query(`
          CREATE TABLE IF NOT EXISTS motoristas (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL UNIQUE,
            telefone VARCHAR(20)
          );
        `);
        console.log('Tabela "motoristas" verificada/criada.');

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
    