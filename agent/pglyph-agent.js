/**
 * PGLYPH RESTORER - AGENTE DE BANDEJA DO WINDOWS (System Tray Daemon)
 * 
 * Este agente executa em segundo plano no Windows e monitora:
 * 1. O Clipboard (CTRL+C) global do Windows (Word, VS Code, Whatsapp, Bloco de Notas, etc.)
 * 2. As imagens deletadas no computador (Lixeira / Pastas Mídia)
 * 
 * Funciona mesmo quando o navegador está FECHADO!
 */

const { exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

const API_HOST = process.env.PGLYPH_API_HOST || 'localhost';
const PORTS_TO_TRY = [5001, 8080, 5000];

let activePort = parseInt(process.env.PGLYPH_API_PORT, 10) || 5001;
let lastClipboardText = '';

console.log('====================================================');
console.log('⚡ PGLYPH RESTORER - AGENTE AUTOMÁTICO DE BANDEJA DO WINDOWS');
console.log('====================================================');
console.log(`🌐 Tentando conectar à API Pglyph em: http://${API_HOST}:${activePort}/api`);
console.log('📡 Monitorando CTRL+C global e arquivos deletados do PC em tempo real...\n');

// 1. MONITORAMENTO DO CTRL+C GLOBAL DO WINDOWS
function pollSystemClipboard() {
  exec('powershell -command "Get-Clipboard"', { encoding: 'utf8' }, (err, stdout) => {
    if (!err && stdout) {
      const text = stdout.trim();
      if (text && text !== lastClipboardText && text.length > 0 && text.length < 50000) {
        lastClipboardText = text;
        console.log(`[CTRL+C DETECTADO NO WINDOWS] "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`);
        sendToBackend('/api/clipboard', { content: text });
      }
    }
  });
}

// 2. ENVO RESILIENTE COM TENTATIVA EM MÚLTIPLAS PORTAS (5001, 8080, 5000)
function sendToBackend(endpoint, payload) {
  const data = JSON.stringify(payload);

  const attemptSend = (portIndex) => {
    if (portIndex >= PORTS_TO_TRY.length) return;
    const port = PORTS_TO_TRY[portIndex];

    const req = http.request(
      {
        hostname: API_HOST,
        port: port,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          activePort = port;
          console.log(`  ✓ Sincronizado com Pglyph Server na porta ${port} (${endpoint})`);
        } else {
          attemptSend(portIndex + 1);
        }
      }
    );

    req.on('error', () => {
      attemptSend(portIndex + 1);
    });

    req.write(data);
    req.end();
  };

  attemptSend(0);
}

// 3. MONITORAMENTO DE IMAGENS NA LIXEIRA / PASTAS DE MÍDIA
function monitorDeletedImages() {
  const home = os.homedir();
  const watchDirs = [
    path.join(home, 'Pictures'),
    path.join(home, 'Downloads'),
    path.join(home, 'Desktop'),
  ];

  const knownFiles = new Set();

  watchDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      try {
        fs.readdirSync(dir).forEach((f) => knownFiles.add(path.join(dir, f)));
      } catch (e) {}
    }
  });

  setInterval(() => {
    watchDirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        try {
          const currentFiles = new Set(fs.readdirSync(dir).map((f) => path.join(dir, f)));
          
          for (const oldFile of knownFiles) {
            if (!currentFiles.has(oldFile) && oldFile.startsWith(dir)) {
              const ext = path.extname(oldFile).toLowerCase();
              if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) {
                console.log(`[IMAGEM DELETADA DO PC] ${path.basename(oldFile)}`);
                sendToBackend('/api/images', {
                  fileName: path.basename(oldFile),
                  originalPath: oldFile.replace(/\\/g, '/'),
                  fileSize: '2.5 MB',
                  category: 'Fotos PC',
                });
              }
              knownFiles.delete(oldFile);
            }
          }

          currentFiles.forEach((f) => knownFiles.add(f));
        } catch (e) {}
      }
    });
  }, 10000);
}

// Inicializa os loops de captura contínua
setInterval(pollSystemClipboard, 1200);
monitorDeletedImages();
