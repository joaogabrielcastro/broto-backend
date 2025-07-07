const fs = require("fs");
const path = require("path");

const origem = path.resolve(__dirname, "caminhoes.db");
const destino = path.resolve(__dirname, "backups");

if (!fs.existsSync(destino)) {
  fs.mkdirSync(destino);
}

const agora = new Date();
const timestamp = agora.toISOString().replace(/[:.]/g, "-");
const nomeBackup = `backup-${timestamp}.db`;

const destinoFinal = path.join(destino, nomeBackup);

fs.copyFile(origem, destinoFinal, (err) => {
  if (err) {
    console.error("❌ Erro ao criar backup:", err);
  } else {
    console.log(`✅ Backup criado em: ${destinoFinal}`);
  }
});
