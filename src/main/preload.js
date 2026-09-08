const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    closeWindow: () => ipcRenderer.send('window-close'),
    checkDependencies: () => ipcRenderer.invoke('check-dependencies'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getMetadata: (url) => ipcRenderer.invoke('get-metadata', url),
    updateYtdlp: () => ipcRenderer.invoke('update-ytdlp'),
    startDownload: (payload) => ipcRenderer.send('start-download', payload),
    showInFolder: (path) => ipcRenderer.send('show-in-folder', path),
    sendNotification: (data) => ipcRenderer.send('send-notification', data),
    onProgress: (callback) => ipcRenderer.on('download-progress', (_event, val) => callback(val)),
    onLog: (callback) => ipcRenderer.on('download-log', (_event, val) => callback(val)),
    onFilePath: (callback) => ipcRenderer.on('download-filepath', (_event, val) => callback(val)),
    onComplete: (callback) => ipcRenderer.on('download-complete', (_event, val) => callback(val))
});