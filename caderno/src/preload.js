const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // eventos do menu
  onNewTab: cb => ipcRenderer.on('tab:new', cb),
  onOpen: cb => ipcRenderer.on('file:open', cb),
  onSave: cb => ipcRenderer.on('file:save', cb),

  // chamadas IPC
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: data => ipcRenderer.invoke('save-file', data)
})