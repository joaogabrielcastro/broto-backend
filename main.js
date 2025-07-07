const { app, BrowserWindow } = require("electron");
const path = require("path");
const { exec } = require("child_process");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Carrega a interface React compilada
  win.loadFile("frontend/dist/index.html");

  // Inicia o backend (index.js)
  exec("node index.js", (error, stdout, stderr) => {
    if (error) console.error(`Erro backend: ${error.message}`);
    if (stderr) console.error(`stderr: ${stderr}`);
    if (stdout) console.log(`stdout: ${stdout}`);
  });
}

app.whenReady().then(createWindow);
