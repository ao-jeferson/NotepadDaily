const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("menu", {
  onNewFile: (cb) => ipcRenderer.on("menu:file:new", cb),
  onOpenFile: (cb) => ipcRenderer.on("menu:file:open", cb),
  onSaveFile: (cb) => ipcRenderer.on("menu:file:save", cb),
  onSaveAsFile: (cb) => ipcRenderer.on("menu:file:saveAs", cb),
  onCloseTab: (cb) => ipcRenderer.on("menu:file:closeTab", cb),
  onToggleWordWrap: (cb) => ipcRenderer.on("menu:view:wordWrap", (_, checked) => cb(checked))
});


contextBridge.exposeInMainWorld("fs", {
  openDialog: () => ipcRenderer.invoke("fs:open-dialog"),
  saveDialog: () => ipcRenderer.invoke("fs:save-dialog"),
  readFile: (p) => ipcRenderer.invoke("fs:readFile", p),
  writeFile: (p, c) => ipcRenderer.invoke("fs:writeFile", p, c)
});

contextBridge.exposeInMainWorld("app", {
  setWindowTitle: (title) => ipcRenderer.invoke("window:set-title", title)
});
