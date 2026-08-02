const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateReady: (callback) => ipcRenderer.on('update-ready-to-install', (event, info) => callback(info)),
  restartAndInstall: () => ipcRenderer.send('app-restart-install'),
  openExternal: (url) => ipcRenderer.send('open-external-url', url)
});
