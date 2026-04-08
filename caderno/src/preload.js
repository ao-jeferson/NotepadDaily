
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  onNewTab: cb => ipcRenderer.on('tab:new', cb),
  onCloseTab: cb => ipcRenderer.on('tab:close', cb),

  onOpen: cb => ipcRenderer.on('file:open', cb),
  onSave: cb => ipcRenderer.on('file:save', cb),

  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: data => ipcRenderer.invoke('save-file', data)
})
