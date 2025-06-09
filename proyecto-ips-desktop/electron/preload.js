const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes exponer APIs seguras al proceso renderer
  platform: process.platform,
  versions: process.versions
});