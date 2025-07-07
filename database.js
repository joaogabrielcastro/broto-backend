const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./caminhoes.db'); // Caminho relativo

db.serialize(() => {
    // Tabela de caminhões (mantida como está)
    db.run(`CREATE TABLE IF NOT EXISTS caminhoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placa TEXT NOT NULL UNIQUE,
        status_atual TEXT
    )`);

    // NOVA TABELA: Motoristas
    db.run(`CREATE TABLE IF NOT EXISTS motoristas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        cnh TEXT UNIQUE,
        telefone TEXT
    )`);

    // Tabela de viagens (com novas colunas para motorista e rota)
    db.run(`CREATE TABLE IF NOT EXISTS viagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caminhao_id INTEGER,
        motorista_id INTEGER,  -- NOVA COLUNA
        inicio TEXT,
        fim TEXT,
        origem TEXT,           -- NOVA COLUNA
        destino TEXT,          -- NOVA COLUNA
        frete REAL,
        lucro_total REAL,
        data_termino TEXT,
        status TEXT,
        FOREIGN KEY (caminhao_id) REFERENCES caminhoes(id),
        FOREIGN KEY (motorista_id) REFERENCES motoristas(id) -- NOVA FOREIGN KEY
    )`);
});

module.exports = db;
