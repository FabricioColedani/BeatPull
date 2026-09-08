const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 780,
    minWidth: 850,
    minHeight: 650,
    frame: false, // Quita los bordes nativos feos de Windows
    transparent: false,
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

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Control de Ventana Personalizada
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

// Comprobar dependencias
ipcMain.handle('check-dependencies', () => {
  return new Promise((resolve) => {
    const ytdlp = spawn('yt-dlp', ['--version']);
    ytdlp.on('close', (code) => resolve(code === 0));
    ytdlp.on('error', () => resolve(false));
  });
});

// Selector de Carpeta
ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Selecciona la carpeta de descarga'
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Inicio de Descarga
ipcMain.on('start-download', (event, payload) => {
  const argsArray = payload?.argsArray || [];
  const downloadPath = payload?.downloadPath || app.getPath('downloads');

  const ytdlpProcess = spawn('yt-dlp', argsArray, { cwd: downloadPath });

  ytdlpProcess.stdout.on('data', (data) => {
    const logOutput = data.toString();
    event.sender.send('download-log', logOutput);

    const progressRegex = /\[download\]\s+(\d+\.\d+)%/;
    const match = logOutput.match(progressRegex);

    if (match) {
      event.sender.send('download-progress', match[1]);
    }
  });

  ytdlpProcess.stderr.on('data', (data) => {
    event.sender.send('download-log', `ERROR: ${data.toString()}`);
  });

  ytdlpProcess.on('close', (code) => {
    event.sender.send('download-complete', code);
  });

  ytdlpProcess.on('error', (err) => {
    event.sender.send('download-log', `ERROR DE SISTEMA: ${err.message}`);
    event.sender.send('download-complete', 1);
  });
});