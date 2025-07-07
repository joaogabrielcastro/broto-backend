const express = require("express");
const cors = require("cors");
const db = require("./database"); // Assumindo que este arquivo configura a conexão com o SQLite

const app = express();
app.use(cors());
app.use(express.json());

// Rota inicial - Verifica se a API está rodando
app.get("/", (req, res) => {
  res.status(200).send("API de caminhões rodando!");
});

// **********************************************
// NOVAS ROTAS PARA MOTORISTAS
// **********************************************

// 6. Cadastrar motorista
app.post("/motoristas", (req, res) => {
  const { nome, cnh, telefone } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: "O nome do motorista é obrigatório." });
  }
  if (!cnh || typeof cnh !== 'string' || cnh.trim() === '') {
    return res.status(400).json({ erro: "A CNH do motorista é obrigatória." });
  }

  db.run(
    `INSERT INTO motoristas (nome, cnh, telefone) VALUES (?, ?, ?)`,
    [nome, cnh, telefone],
    function (err) {
      if (err) {
        if (err.message.includes("SQLITE_CONSTRAINT_UNIQUE")) {
          return res.status(409).json({ erro: "Motorista com este nome ou CNH já cadastrado." });
        }
        console.error("Erro no DB ao cadastrar motorista:", err.message);
        return res.status(500).json({ erro: "Erro interno do servidor ao cadastrar motorista." });
      }
      res.status(201).json({ id: this.lastID, nome, cnh, telefone });
    }
  );
});

// Listar todos os motoristas
app.get("/motoristas", (req, res) => {
  db.all("SELECT id, nome, cnh, telefone FROM motoristas", [], (err, rows) => {
    if (err) {
      console.error("Erro no DB ao listar motoristas:", err.message);
      return res.status(500).json({ erro: err.message });
    }
    res.status(200).json(rows);
  });
});

// **********************************************
// ROTAS EXISTENTES (Caminhões e Viagens) - ATUALIZADAS
// **********************************************

// 1. Cadastrar caminhão (mantida)
app.post("/caminhoes", (req, res) => {
  const { placa, status_atual } = req.body;

  if (!placa || typeof placa !== 'string' || placa.trim() === '') {
    return res.status(400).json({ erro: "A placa do caminhão é obrigatória." });
  }

  const status = status_atual || "Disponível";

  db.run(
    `INSERT INTO caminhoes (placa, status_atual) VALUES (?, ?)`,
    [placa.toUpperCase(), status],
    function (err) {
      if (err) {
        if (err.message.includes("SQLITE_CONSTRAINT_UNIQUE")) {
          return res.status(409).json({ erro: "Esta placa já está cadastrada." });
        }
        console.error("Erro no DB ao cadastrar caminhão:", err.message);
        return res.status(500).json({ erro: "Erro interno do servidor ao cadastrar caminhão." });
      }
      res.status(201).json({ id: this.lastID, placa: placa.toUpperCase(), status_atual: status });
    }
  );
});

// 2. Cadastrar viagem - ATUALIZADA com motorista_id, origem, destino
app.post("/viagens", (req, res) => {
  let { placa, motorista_id, inicio, fim, origem, destino, frete, lucro_total, data_termino, status } = req.body;

  // Validação de entrada: todos os campos obrigatórios e tipos
  if (!placa || typeof placa !== 'string' || placa.trim() === '') {
    return res.status(400).json({ erro: "A placa do caminhão é obrigatória para a viagem." });
  }
  if (isNaN(parseInt(motorista_id))) { // motorista_id deve ser um número inteiro
    return res.status(400).json({ erro: "O motorista é obrigatório para a viagem." });
  }
  if (!inicio || typeof inicio !== 'string' || inicio.trim() === '') {
    return res.status(400).json({ erro: "A data de início da viagem é obrigatória." });
  }
  if (!fim || typeof fim !== 'string' || fim.trim() === '') {
    return res.status(400).json({ erro: "A data de fim da viagem é obrigatória." });
  }
  if (!origem || typeof origem !== 'string' || origem.trim() === '') {
    return res.status(400).json({ erro: "A origem da viagem é obrigatória." });
  }
  if (!destino || typeof destino !== 'string' || destino.trim() === '') {
    return res.status(400).json({ erro: "O destino da viagem é obrigatório." });
  }
  if (isNaN(parseFloat(frete)) || parseFloat(frete) < 0) {
    return res.status(400).json({ erro: "O valor do frete deve ser um número positivo." });
  }
  if (isNaN(parseFloat(lucro_total))) {
    return res.status(400).json({ erro: "O lucro total deve ser um número." });
  }
  if (!status || typeof status !== 'string' || (status !== 'Em andamento' && status !== 'Finalizada')) {
    return res.status(400).json({ erro: "Status da viagem inválido. Use 'Em andamento' ou 'Finalizada'." });
  }

  // Converte valores para o tipo correto, caso venham como string
  motorista_id = parseInt(motorista_id);
  frete = parseFloat(frete);
  lucro_total = parseFloat(lucro_total);
  placa = placa.toUpperCase();

  db.get(`SELECT id FROM caminhoes WHERE placa = ?`, [placa], (err, caminhaoRow) => {
    if (err) {
      console.error("Erro no DB ao buscar caminhão para viagem:", err.message);
      return res.status(500).json({ erro: "Erro interno do servidor ao buscar caminhão." });
    }
    if (!caminhaoRow) {
      return res.status(404).json({ erro: "Caminhão não encontrado para a placa informada." });
    }

    db.get(`SELECT id FROM motoristas WHERE id = ?`, [motorista_id], (err, motoristaRow) => {
      if (err) {
        console.error("Erro no DB ao buscar motorista para viagem:", err.message);
        return res.status(500).json({ erro: "Erro interno do servidor ao buscar motorista." });
      }
      if (!motoristaRow) {
        return res.status(404).json({ erro: "Motorista não encontrado para o ID informado." });
      }

      const caminhao_id = caminhaoRow.id;

      db.run(
        `INSERT INTO viagens (caminhao_id, motorista_id, inicio, fim, origem, destino, frete, lucro_total, data_termino, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [caminhao_id, motorista_id, inicio, fim, origem, destino, frete, lucro_total, data_termino, status],
        function (err) {
          if (err) {
            console.error("Erro no DB ao cadastrar viagem:", err.message);
            return res.status(500).json({ erro: "Erro interno do servidor ao cadastrar viagem." });
          }
          res.status(201).json({ id: this.lastID, caminhao_id, motorista_id, inicio, fim, origem, destino, frete, lucro_total, data_termino, status });
        }
      );
    });
  });
});

// Listar todos os caminhões (mantida)
app.get("/caminhoes", (req, res) => {
  db.all("SELECT * FROM caminhoes", [], (err, rows) => {
    if (err) {
      console.error("Erro no DB ao listar caminhões:", err.message);
      return res.status(500).json({ erro: err.message });
    }
    res.status(200).json(rows);
  });
});

// 4. Situação atual dos caminhões (viagens em andamento) - ATUALIZADA com motorista e rota
app.get("/situacao", (req, res) => {
  const sql = `
    SELECT
      c.placa,
      v.id as viagem_id,
      v.inicio,
      v.status,
      v.origem,      -- NOVA COLUNA
      v.destino,     -- NOVA COLUNA
      m.nome as motorista_nome -- NOVO CAMPO DO MOTORISTA
    FROM caminhoes c
    JOIN viagens v ON c.id = v.caminhao_id
    JOIN motoristas m ON v.motorista_id = m.id -- NOVO JOIN
    WHERE v.status = 'Em andamento'
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erro no DB ao buscar situação atual:", err.message);
      return res.status(500).json({ erro: "Erro interno do servidor ao buscar situação atual." });
    }
    res.status(200).json(rows);
  });
});

// Listar viagens em andamento (já existente e clara) - ATUALIZADA com motorista e rota - MOVIDA PARA ANTES DE /viagens/:placa
app.get("/viagens/ativas", (req, res) => {
  const sql = `
    SELECT
      v.id, v.inicio, v.fim, v.frete, v.lucro_total, v.data_termino, v.status,
      c.placa,
      m.nome as motorista_nome, -- NOVO CAMPO
      v.origem,                 -- NOVO CAMPO
      v.destino                 -- NOVO CAMPO
    FROM viagens v
    JOIN caminhoes c ON v.caminhao_id = c.id
    JOIN motoristas m ON v.motorista_id = m.id -- NOVO JOIN
    WHERE v.status = 'Em andamento'
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erro no DB ao listar viagens ativas:", err.message);
      return res.status(500).json({ erro: err.message });
    }
    res.status(200).json(rows);
  });
});

// Listar viagens finalizadas - ATUALIZADA com motorista e rota - MOVIDA PARA ANTES DE /viagens/:placa
app.get("/viagens/finalizadas", (req, res) => {
  const sql = `
    SELECT
      v.id, v.inicio, v.fim, v.frete, v.lucro_total, v.data_termino, v.status,
      c.placa,
      m.nome as motorista_nome, -- NOVO CAMPO
      v.origem,                 -- NOVO CAMPO
      v.destino                 -- NOVO CAMPO
    FROM viagens v
    JOIN caminhoes c ON v.caminhao_id = c.id
    JOIN motoristas m ON v.motorista_id = m.id -- NOVO JOIN
    WHERE v.status = 'Finalizada'
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erro no DB ao listar viagens finalizadas:", err.message);
      return res.status(500).json({ erro: err.message });
    }
    res.status(200).json(rows);
  });
});

// 3. Buscar viagens por placa - ATUALIZADA com motorista e rota - MOVIDA PARA DEPOIS DAS ROTAS FIXAS /viagens/XYZ
app.get("/viagens/:placa", (req, res) => {
  const { placa } = req.params;

  if (!placa || typeof placa !== 'string' || placa.trim() === '') {
    return res.status(400).json({ erro: "A placa é obrigatória para a consulta." });
  }

  db.get(
    `SELECT id FROM caminhoes WHERE placa = ?`,
    [placa.toUpperCase()],
    (err, caminhao) => {
      if (err) {
        console.error("Erro no DB ao buscar caminhão por placa:", err.message);
        return res.status(500).json({ erro: "Erro interno do servidor ao buscar caminhão." });
      }
      if (!caminhao) {
        return res.status(404).json({ erro: "Caminhão não encontrado para a placa informada." });
      }

      const sql = `
        SELECT
          v.id, v.inicio, v.fim, v.frete, v.lucro_total, v.data_termino, v.status,
          v.origem, v.destino, -- NOVOS CAMPOS
          m.nome as motorista_nome -- NOVO CAMPO DO MOTORISTA
        FROM viagens v
        JOIN motoristas m ON v.motorista_id = m.id -- NOVO JOIN
        WHERE v.caminhao_id = ?
      `;

      db.all(sql, [caminhao.id], (err, viagens) => {
        if (err) {
          console.error("Erro no DB ao buscar viagens do caminhão:", err.message);
          return res.status(500).json({ erro: "Erro interno do servidor ao buscar viagens." });
        }
        res.status(200).json({ placa: placa.toUpperCase(), viagens });
      });
    }
  );
});

app.get("/produtividade", (req, res) => {
  const sql = `
    SELECT
      c.placa,
      v.lucro_total,
      v.data_termino,
      m.nome as motorista_nome, -- NOVO CAMPO
      v.origem,                 -- NOVO CAMPO
      v.destino                 -- NOVO CAMPO
    FROM caminhoes c
    JOIN viagens v ON c.id = v.caminhao_id
    JOIN motoristas m ON v.motorista_id = m.id -- NOVO JOIN
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Erro no DB ao buscar produtividade:", err.message);
      return res.status(500).json({ erro: "Erro interno do servidor ao buscar produtividade." });
    }

    const resultado = rows.map((item) => ({
      placa: item.placa,
      lucro_total: parseFloat(item.lucro_total),
      status: parseFloat(item.lucro_total) >= 30000 ? "Lucro" : "Prejuízo",
      data_termino: item.data_termino,
      motorista_nome: item.motorista_nome, // Inclui o nome do motorista
      origem: item.origem,
      destino: item.destino
    }));

    res.status(200).json(resultado);
  });
});

// Editar viagem (PUT) - ATUALIZADA com motorista_id, origem, destino
app.put("/viagens/:id", (req, res) => {
  const id = req.params.id;
  let { inicio, fim, frete, lucro_total, status, motorista_id, origem, destino } = req.body;

  // Validação de entrada para os campos a serem atualizados
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ erro: "ID da viagem inválido." });
  }
  if (!inicio || typeof inicio !== 'string' || inicio.trim() === '') {
    return res.status(400).json({ erro: "A data de início é obrigatória para a edição." });
  }
  if (!fim || typeof fim !== 'string' || fim.trim() === '') {
    return res.status(400).json({ erro: "A data de fim é obrigatória para a edição." });
  }
  if (isNaN(parseFloat(frete)) || parseFloat(frete) < 0) {
    return res.status(400).json({ erro: "O valor do frete deve ser um número positivo." });
  }
  if (isNaN(parseFloat(lucro_total))) {
    return res.status(400).json({ erro: "O lucro total deve ser um número." });
  }
  if (!status || typeof status !== 'string' || (status !== 'Em andamento' && status !== 'Finalizada')) {
    return res.status(400).json({ erro: "Status da viagem inválido. Use 'Em andamento' ou 'Finalizada'." });
  }
  if (isNaN(parseInt(motorista_id))) {
    return res.status(400).json({ erro: "O motorista é obrigatório para a edição da viagem." });
  }
  if (!origem || typeof origem !== 'string' || origem.trim() === '') {
    return res.status(400).json({ erro: "A origem da viagem é obrigatória para a edição." });
  }
  if (!destino || typeof destino !== 'string' || destino.trim() === '') {
    return res.status(400).json({ erro: "O destino da viagem é obrigatório para a edição." });
  }

  motorista_id = parseInt(motorista_id);
  frete = parseFloat(frete);
  lucro_total = parseFloat(lucro_total);

  // Antes de atualizar, verificar se o motorista_id existe
  db.get(`SELECT id FROM motoristas WHERE id = ?`, [motorista_id], (err, motoristaRow) => {
    if (err) {
      console.error("Erro no DB ao buscar motorista para edição de viagem:", err.message);
      return res.status(500).json({ erro: "Erro interno do servidor ao buscar motorista." });
    }
    if (!motoristaRow) {
      return res.status(404).json({ erro: "Motorista não encontrado para o ID fornecido na edição." });
    }

    const sql = `UPDATE viagens SET inicio = ?, fim = ?, frete = ?, lucro_total = ?, status = ?, motorista_id = ?, origem = ?, destino = ? WHERE id = ?`;
    const params = [inicio, fim, frete, lucro_total, status, motorista_id, origem, destino, id];

    db.run(sql, params, function (err) {
      if (err) {
        console.error("Erro no DB ao editar viagem:", err.message);
        return res.status(500).json({ erro: "Erro interno do servidor ao editar viagem." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: "Viagem não encontrada para edição." });
      }
      res.status(200).json({ atualizado: true, id: id });
    });
  });
});

// Concluir viagem (muda status para Finalizada) (mantida)
app.patch("/viagens/:id/finalizar", (req, res) => {
  const id = req.params.id;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ erro: "ID da viagem inválido." });
  }

  db.run(
    "UPDATE viagens SET status = 'Finalizada' WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("Erro no DB ao finalizar viagem:", err.message);
        return res.status(500).json({ erro: "Erro interno do servidor ao finalizar viagem." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: "Viagem não encontrada ou já finalizada." });
      }
      res.status(200).json({ finalizada: true, id: id });
    }
  );
});

// Middleware de tratamento de erros genérico (captura erros não tratados em rotas)
app.use((err, req, res, next) => {
  console.error(err.stack); // Loga o erro completo para depuração
  res.status(500).json({ erro: "Ocorreu um erro inesperado no servidor." });
});

// Iniciar servidor
app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});
