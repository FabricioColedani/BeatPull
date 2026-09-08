const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    closeWindow: () => ipcRenderer.send('window-close'),
    checkDependencies: () => ipcRenderer.invoke('check-dependencies'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    startDownload: (payload) => ipcRenderer.send('start-download', payload),
    onProgress: (callback) => ipcRenderer.on('download-progress', (_event, value) => callback(value)),
    onLog: (callback) => ipcRenderer.on('download-log', (_event, value) => callback(value)),
    onComplete: (callback) => ipcRenderer.on('download-complete', (_event, value) => callback(value))
});