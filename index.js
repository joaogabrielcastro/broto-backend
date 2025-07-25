const express = require("express");
const cors = require("cors");
const db = require("./database"); 

const app = express();

// Configuração CORS - CRUCIAL para o frontend no Vercel
const corsOptions = {
  origin: 'https://broto-frontend.vercel.app', // Sua URL real do Vercel
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// Rota inicial - Verifica se a API está rodando
app.get("/", async (req, res) => {
  try {
    await db.query('SELECT 1'); 
    res.status(200).send("API de caminhões rodando e conectada ao DB!");
  } catch (err) {
    console.error("Erro na conexão inicial com o banco de dados:", err);
    res.status(500).send("API de caminhões rodando, mas ERRO na conexão com o DB!");
  }
});

// **********************************************
// NOVAS ROTAS PARA CLIENTES
// **********************************************

// 7. Cadastrar cliente
app.post("/clientes", async (req, res) => {
  const { nome, telefone, email, endereco } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: "O nome do cliente é obrigatório." });
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ erro: "O email do cliente é obrigatório." });
  }

  try {
    const result = await db.query(
      `INSERT INTO clientes (nome, telefone, email, endereco) VALUES ($1, $2, $3, $4) RETURNING id`,
      [nome, telefone, email, endereco]
    );
    res.status(201).json({ id: result.rows[0].id, nome, telefone, email, endereco });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: "Cliente com este email já cadastrado." });
    }
    console.error("Erro no DB ao cadastrar cliente:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao cadastrar cliente." });
  }
});

// Listar todos os clientes
app.get("/clientes", async (req, res) => {
  try {
    const result = await db.query("SELECT id, nome, telefone, email, endereco FROM clientes");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro no DB ao listar clientes:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

// **********************************************
// ROTAS PARA MOTORISTAS - ATUALIZADAS (SEM CNH)
// **********************************************

// 6. Cadastrar motorista - SEM CNH
app.post("/motoristas", async (req, res) => {
  const { nome, telefone } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: "O nome do motorista é obrigatório." });
  }

  try {
    const result = await db.query(
      `INSERT INTO motoristas (nome, telefone) VALUES ($1, $2) RETURNING id`,
      [nome, telefone]
    );
    res.status(201).json({ id: result.rows[0].id, nome, telefone });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: "Motorista com este nome já cadastrado." });
    }
    console.error("Erro no DB ao cadastrar motorista:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao cadastrar motorista." });
  }
});

// Listar todos os motoristas
app.get("/motoristas", async (req, res) => {
  try {
    const result = await db.query("SELECT id, nome, telefone FROM motoristas");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro no DB ao listar motoristas:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

// Rota para excluir motorista (mantida)
app.delete("/motoristas/:id", async (req, res) => {
  const id = req.params.id;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ erro: "ID do motorista inválido." });
  }

  try {
    const checkViagens = await db.query(`SELECT COUNT(*) FROM viagens WHERE motorista_id = $1`, [id]);
    if (parseInt(checkViagens.rows[0].count) > 0) {
      return res.status(409).json({ erro: "Não é possível excluir o motorista pois ele está associado a viagens." });
    }

    const result = await db.query(`DELETE FROM motoristas WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Motorista não encontrado para exclusão." });
    }
    res.status(200).json({ excluido: true, id: id });
  } catch (err) {
    console.error("Erro no DB ao excluir motorista:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao excluir motorista." });
  }
});

// **********************************************
// ROTAS EXISTENTES (Caminhões e Viagens) - ATUALIZADAS (COM CUSTOS E LUCRO)
// **********************************************

// 1. Cadastrar caminhão
app.post("/caminhoes", async (req, res) => {
  const { placa, nome, status_atual } = req.body;

  if (!placa || typeof placa !== 'string' || placa.trim() === '') {
    return res.status(400).json({ erro: "A placa do caminhão é obrigatória." });
  }

  const status = status_atual || "Disponível";

  try {
    const result = await db.query(
      `INSERT INTO caminhoes (placa, nome, status_atual) VALUES ($1, $2, $3) RETURNING id`,
      [placa.toUpperCase(), nome, status]
    );
    res.status(201).json({ id: result.rows[0].id, placa: placa.toUpperCase(), nome: nome, status_atual: status });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: "Esta placa já está cadastrada." });
    }
    console.error("Erro no DB ao cadastrar caminhão:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao cadastrar caminhão." });
  }
});

// Listar todos os caminhões
app.get("/caminhoes", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM caminhoes");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro no DB ao listar caminhões:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

// 2. Cadastrar viagem - ATUALIZADA (SEM LUCRO_TOTAL INICIAL)
app.post("/viagens", async (req, res) => {
  let { placa, motorista_id, cliente_id, inicio, fim, origem, destino, frete, data_termino, status } = req.body; // LUCRO_TOTAL REMOVIDO

  // Validação de entrada
  if (!placa || typeof placa !== 'string' || placa.trim() === '') {
    return res.status(400).json({ erro: "A placa do caminhão é obrigatória para a viagem." });
  }
  if (isNaN(parseInt(motorista_id))) {
    return res.status(400).json({ erro: "O motorista é obrigatório para a viagem." });
  }
  if (isNaN(parseInt(cliente_id))) {
    return res.status(400).json({ erro: "O cliente é obrigatório para a viagem." });
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
  // LUCRO_TOTAL REMOVIDO da validação inicial
  // if (isNaN(parseFloat(lucro_total))) { ... }
  if (!status || typeof status !== 'string' || (status !== 'Em andamento' && status !== 'Finalizada')) {
    return res.status(400).json({ erro: "Status da viagem inválido. Use 'Em andamento' ou 'Finalizada'." });
  }

  motorista_id = parseInt(motorista_id);
  cliente_id = parseInt(cliente_id);
  frete = parseFloat(frete);
  // lucro_total = parseFloat(lucro_total); // REMOVIDO

  try {
    const caminhaoResult = await db.query(`SELECT id FROM caminhoes WHERE placa = $1`, [placa]);
    if (caminhaoResult.rows.length === 0) {
      return res.status(404).json({ erro: "Caminhão não encontrado para a placa informada." });
    }
    const caminhao_id = caminhaoResult.rows[0].id;

    const motoristaResult = await db.query(`SELECT id FROM motoristas WHERE id = $1`, [motorista_id]);
    if (motoristaResult.rows.length === 0) {
      return res.status(404).json({ erro: "Motorista não encontrado para o ID informado." });
    }

    const clienteResult = await db.query(`SELECT id FROM clientes WHERE id = $1`, [cliente_id]);
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado para o ID informado." });
    }

    // CUSTOS e LUCRO_TOTAL não são inseridos aqui, custos tem DEFAULT 0
    const result = await db.query(
      `INSERT INTO viagens (caminhao_id, motorista_id, cliente_id, inicio, fim, origem, destino, frete, data_termino, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`, // ATUALIZADO PARA 10 PARÂMETROS
      [caminhao_id, motorista_id, cliente_id, inicio, fim, origem, destino, frete, data_termino, status]
    );
    res.status(201).json({ id: result.rows[0].id, caminhao_id, motorista_id, cliente_id, inicio, fim, origem, destino, frete, data_termino, status });
  } catch (err) {
    console.error("Erro no DB ao cadastrar viagem:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao cadastrar viagem." });
  }
});

// 4. Situação atual dos caminhões (viagens em andamento) - ATUALIZADA com motorista e rota + CLIENTE
app.get("/situacao-atual-caminhoes", async (req, res) => {
  const sql = `
    SELECT
      c.placa,
      c.nome as caminhao_nome, -- NOVO CAMPO
      v.id as viagem_id,
      v.inicio,
      v.fim, -- Adicionado para consistência, mesmo que não usado na tela
      v.origem,
      v.destino,
      v.frete, -- Adicionado para consistência
      v.custos, -- NOVO CAMPO
      v.lucro_total, -- NOVO CAMPO
      v.data_termino, -- Adicionado para consistência
      v.status,
      m.nome as motorista_nome,
      cl.nome as cliente_nome
    FROM caminhoes c
    JOIN viagens v ON c.id = v.caminhao_id
    JOIN motoristas m ON v.motorista_id = m.id
    JOIN clientes cl ON v.cliente_id = cl.id
    WHERE v.status = 'Em andamento'
  `;
  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro no DB ao buscar situação atual:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao buscar situação atual." });
  }
});

// Listar viagens em andamento (já existente e clara) - ATUALIZADA com motorista e rota + CLIENTE
app.get("/viagens-ativas-lista", async (req, res) => {
  const sql = `
    SELECT
      v.id, v.inicio, v.fim, v.frete, v.custos, v.lucro_total, v.data_termino, v.status, -- CUSTOS E LUCRO
      c.placa,
      c.nome as caminhao_nome, -- NOVO CAMPO
      m.nome as motorista_nome,
      v.origem,
      v.destino,
      cl.nome as cliente_nome
    FROM viagens v
    JOIN caminhoes c ON v.caminhao_id = c.id
    JOIN motoristas m ON v.motorista_id = m.id
    JOIN clientes cl ON v.cliente_id = cl.id
    WHERE v.status = 'Em andamento'
  `;
  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro no DB ao listar viagens ativas:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

// Listar viagens finalizadas - ATUALIZADA com motorista e rota + CLIENTE
app.get("/viagens-finalizadas-lista", async (req, res) => {
  const sql = `
    SELECT
      v.id, v.inicio, v.fim, v.frete, v.custos, v.lucro_total, v.data_termino, v.status, -- CUSTOS E LUCRO
      c.placa,
      c.nome as caminhao_nome, -- NOVO CAMPO
      m.nome as motorista_nome,
      v.origem,
      v.destino,
      cl.nome as cliente_nome
    FROM viagens v
    JOIN caminhoes c ON v.caminhao_id = c.id
    JOIN motoristas m ON v.motorista_id = m.id
    JOIN clientes cl ON v.cliente_id = cl.id
    WHERE v.status = 'Finalizada'
  `;

  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro no DB ao listar viagens finalizadas:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

// 3. Buscar viagens por placa - ATUALIZADA com motorista e rota + CLIENTE
app.get("/viagens-por-placa/:placa", async (req, res) => {
  const { placa } = req.params;

  if (!placa || typeof placa !== 'string' || placa.trim() === '') {
    return res.status(400).json({ erro: "A placa é obrigatória para a consulta." });
  }

  try {
    const caminhaoResult = await db.query(`SELECT id FROM caminhoes WHERE placa = $1`, [placa.toUpperCase()]);
    if (caminhaoResult.rows.length === 0) {
      return res.status(404).json({ erro: "Caminhão não encontrado para a placa informada." });
    }
    const caminhao_id = caminhaoResult.rows[0].id;

    const sql = `
      SELECT
        v.id, v.inicio, v.fim, v.frete, v.custos, v.lucro_total, v.data_termino, v.status, -- CUSTOS E LUCRO
        v.origem, v.destino,
        m.nome as motorista_nome,
        cl.nome as cliente_nome,
        c.nome as caminhao_nome -- NOVO CAMPO
      FROM viagens v
      JOIN motoristas m ON v.motorista_id = m.id
      JOIN clientes cl ON v.cliente_id = cl.id
      JOIN caminhoes c ON v.caminhao_id = c.id -- NOVO JOIN
      WHERE v.caminhao_id = $1
    `;
    const result = await db.query(sql, [caminhao_id]);
    res.status(200).json({ placa: placa.toUpperCase(), viagens: result.rows });
  } catch (err) {
    console.error("Erro no DB ao buscar viagens do caminhão:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao buscar viagens." });
  }
});

// Nova rota para listar TODAS as viagens (se necessário para algum dashboard, etc.)
/*
app.get("/viagens/todas", async (req, res) => {
  const sql = `
    SELECT
      v.id, v.inicio, v.fim, v.frete, v.custos, v.lucro_total, v.data_termino, v.status,
      c.placa,
      c.nome as caminhao_nome,
      m.nome as motorista_nome,
      v.origem,
      v.destino,
      cl.nome as cliente_nome
    FROM viagens v
    JOIN caminhoes c ON v.caminhao_id = c.id
    JOIN motoristas m ON v.motorista_id = m.id
    JOIN clientes cl ON v.cliente_id = cl.id
  `;
  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro no DB ao listar todas as viagens:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao listar todas as viagens." });
  }
});
*/

// Editar viagem (PUT) - ATUALIZADA com custos e cliente_id
app.put("/viagens/:id", async (req, res) => {
  const id = req.params.id;
  let { inicio, fim, frete, custos, lucro_total, status, motorista_id, cliente_id, origem, destino } = req.body; // CUSTOS ADICIONADO

  // Validação de entrada
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
  if (isNaN(parseFloat(custos)) || parseFloat(custos) < 0) { // VALIDAÇÃO DE CUSTOS
    return res.status(400).json({ erro: "O valor dos custos deve ser um número positivo." });
  }
  // LUCRO_TOTAL não é validado aqui, pois será calculado
  // if (isNaN(parseFloat(lucro_total))) { ... }
  if (!status || typeof status !== 'string' || (status !== 'Em andamento' && status !== 'Finalizada')) {
    return res.status(400).json({ erro: "Status da viagem inválido. Use 'Em andamento' ou 'Finalizada'." });
  }
  if (isNaN(parseInt(motorista_id))) {
    return res.status(400).json({ erro: "O motorista é obrigatório para a edição da viagem." });
  }
  if (isNaN(parseInt(cliente_id))) {
    return res.status(400).json({ erro: "O cliente é obrigatório para a edição da viagem." });
  }
  if (!origem || typeof origem !== 'string' || origem.trim() === '') {
    return res.status(400).json({ erro: "A origem da viagem é obrigatória para a edição." });
  }
  if (!destino || typeof destino !== 'string' || destino.trim() === '') {
    return res.status(400).json({ erro: "O destino da viagem é obrigatório para a edição." });
  }

  motorista_id = parseInt(motorista_id);
  cliente_id = parseInt(cliente_id);
  frete = parseFloat(frete);
  custos = parseFloat(custos); // Converte custos
  lucro_total = frete - custos; // CALCULA LUCRO_TOTAL

  try {
    const motoristaResult = await db.query(`SELECT id FROM motoristas WHERE id = $1`, [motorista_id]);
    if (motoristaResult.rows.length === 0) {
      return res.status(404).json({ erro: "Motorista não encontrado para o ID fornecido na edição." });
    }
    const clienteResult = await db.query(`SELECT id FROM clientes WHERE id = $1`, [cliente_id]);
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado para o ID fornecido na edição." });
    }

    const sql = `UPDATE viagens SET inicio = $1, fim = $2, frete = $3, custos = $4, lucro_total = $5, status = $6, motorista_id = $7, cliente_id = $8, origem = $9, destino = $10 WHERE id = $11`; // ATUALIZADO PARA 11 PARÂMETROS
    const params = [inicio, fim, frete, custos, lucro_total, status, motorista_id, cliente_id, origem, destino, id];
    const result = await db.query(sql, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Viagem não encontrada para edição." });
    }
    res.status(200).json({ atualizado: true, id: id });
  } catch (err) {
    console.error("Erro no DB ao editar viagem:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao editar viagem." });
  }
});

// Concluir viagem (muda status para Finalizada) - ATUALIZADA com custos e lucro_total
app.patch("/viagens/:id/finalizar", async (req, res) => {
  const id = req.params.id;
  const { custos } = req.body; // Recebe custos para calcular lucro_total

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ erro: "ID da viagem inválido." });
  }
  if (isNaN(parseFloat(custos)) || parseFloat(custos) < 0) { // Validação de custos
    return res.status(400).json({ erro: "O valor dos custos é obrigatório para finalizar a viagem." });
  }

  try {
    // Primeiro, buscar frete da viagem para calcular lucro_total
    const viagemResult = await db.query(`SELECT frete FROM viagens WHERE id = $1`, [id]);
    if (viagemResult.rows.length === 0) {
      return res.status(404).json({ erro: "Viagem não encontrada para finalizar." });
    }
    const freteViagem = parseFloat(viagemResult.rows[0].frete);
    const lucro_total = freteViagem - parseFloat(custos); // CALCULA LUCRO_TOTAL

    const sql = `UPDATE viagens SET status = 'Finalizada', custos = $1, lucro_total = $2 WHERE id = $3`; // ATUALIZADO
    const result = await db.query(sql, [parseFloat(custos), lucro_total, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Viagem não encontrada ou já finalizada." });
    }
    res.status(200).json({ finalizada: true, id: id, lucro_total: lucro_total });
  } catch (err) {
    console.error("Erro no DB ao finalizar viagem:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao finalizar viagem." });
  }
});

// Rota para excluir motorista (mantida)
app.delete("/motoristas/:id", async (req, res) => {
  const id = req.params.id;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({ erro: "ID do motorista inválido." });
  }

  try {
    const checkViagens = await db.query(`SELECT COUNT(*) FROM viagens WHERE motorista_id = $1`, [id]);
    if (parseInt(checkViagens.rows[0].count) > 0) {
      return res.status(409).json({ erro: "Não é possível excluir o motorista pois ele está associado a viagens." });
    }

    const result = await db.query(`DELETE FROM motoristas WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Motorista não encontrado para exclusão." });
    }
    res.status(200).json({ excluido: true, id: id });
  } catch (err) {
    console.error("Erro no DB ao excluir motorista:", err.message);
    res.status(500).json({ erro: "Erro interno do servidor ao excluir motorista." });
  }
});

// Rota para excluir viagem (REMOVIDA)
// app.delete("/viagens/:id", async (req, res) => { ... });


// Middleware de tratamento de erros genérico (captura erros não tratados em rotas)
app.use((err, req, res, next) => {
  console.error(err.stack); // Loga o erro completo para depuração
  res.status(500).json({ erro: "Ocorreu um erro inesperado no servidor." });
});

// Iniciar servidor
app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});
