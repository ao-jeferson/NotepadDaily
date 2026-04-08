const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  saveFile: (content) => ipcRenderer.send('save-file', content),
  openFile: () => ipcRenderer.send('open-file')
})