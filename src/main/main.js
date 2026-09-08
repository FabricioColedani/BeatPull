const { app, BrowserWindow, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 850,
    minWidth: 900,
    minHeight: 700,
    frame: false,
    backgroundColor: '#09090b',
    icon: path.join(__dirname, '../../assets/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Control de Ventana
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

// Previsualización de Metadatos
ipcMain.handle('get-metadata', async (event, url) => {
  return new Promise((resolve) => {
    const ytdlp = spawn('yt-dlp', ['-j', '--no-warnings', '--flat-playlist', url]);
    let output = '';

    ytdlp.stdout.on('data', (data) => { output += data.toString(); });
    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const json = JSON.parse(output.split('\n')[0]);
          const durationSec = json.duration || 0;
          const mins = Math.floor(durationSec / 60);
          const secs = Math.floor(durationSec % 60).toString().padStart(2, '0');
          
          resolve({
            title: json.title || 'Título Desconocido',
            uploader: json.uploader || json.channel || 'Canal Desconocido',
            thumbnail: json.thumbnail || json.thumbnails?.[0]?.url || '',
            duration: durationSec ? `${mins}:${secs}` : 'N/A'
          });
        } catch { resolve(null); }
      } else resolve(null);
    });
    ytdlp.on('error', () => resolve(null));
  });
});

// Actualizador de yt-dlp
ipcMain.handle('update-ytdlp', async () => {
  return new Promise((resolve) => {
    const ytdlp = spawn('yt-dlp', ['-U']);
    let logs = '';
    ytdlp.stdout.on('data', (d) => logs += d.toString());
    ytdlp.stderr.on('data', (d) => logs += d.toString());
    ytdlp.on('close', (code) => resolve({ success: code === 0, logs }));
  });
});

// Abrir en Explorador de Archivos
ipcMain.on('show-in-folder', (event, filePath) => {
  if (filePath) shell.showItemInFolder(filePath);
});

// Notificaciones Nativas del SO
ipcMain.on('send-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: path.join(__dirname, '../../assets/logo.png') }).show();
  }
});

// Verificación de dependencias y selección de carpetas
ipcMain.handle('check-dependencies', () => {
  return new Promise((resolve) => {
    const ytdlp = spawn('yt-dlp', ['--version']);
    ytdlp.on('close', (code) => resolve(code === 0));
    ytdlp.on('error', () => resolve(false));
  });
});

ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

// Proceso de Descarga
ipcMain.on('start-download', (event, payload) => {
  const argsArray = payload?.argsArray || [];
  const downloadPath = payload?.downloadPath || app.getPath('downloads');

  const ytdlpProcess = spawn('yt-dlp', argsArray, { cwd: downloadPath });

  ytdlpProcess.stdout.on('data', (data) => {
    const logOutput = data.toString();
    event.sender.send('download-log', logOutput);

    const match = logOutput.match(/\[download\]\s+(\d+\.\d+)%/);
    if (match) event.sender.send('download-progress', match[1]);

    const destinationMatch = logOutput.match(/\[ExtractAudio\] Destination:\s+(.+)/) || logOutput.match(/\[download\] Destination:\s+(.+)/);
    if (destinationMatch) {
      event.sender.send('download-filepath', path.join(downloadPath, destinationMatch[1].trim()));
    }
  });

  ytdlpProcess.stderr.on('data', (data) => {
    event.sender.send('download-log', `ERROR: ${data.toString()}`);
  });

  ytdlpProcess.on('close', (code) => event.sender.send('download-complete', code));
  ytdlpProcess.on('error', (err) => {
    event.sender.send('download-log', `ERROR DE SISTEMA: ${err.message}`);
    event.sender.send('download-complete', 1);
  });
});