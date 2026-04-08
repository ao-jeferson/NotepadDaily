const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onNewTab: cb => ipcRenderer.on("tab:new", cb),
  onCloseTab: cb => ipcRenderer.on("tab:close", cb),
  onOpen: cb => ipcRenderer.on("file:open", cb),   
  onSave: cb => ipcRenderer.on("file:save", cb),
  openFile: () => ipcRenderer.invoke("open-file"),     
  saveFile: data => ipcRenderer.invoke("save-file", data)
});

contextBridge.exposeInMainWorld("diffAPI", {
  onDiffPrevious: cb => ipcRenderer.on("diff:previous", cb),
  onDiffExit: cb => ipcRenderer.on("diff:exit", cb)
});

contextBridge.exposeInMainWorld("sessionAPI", {
  save: session => ipcRenderer.invoke("session:save", session),
  load: () => ipcRenderer.invoke("session:load")
});

contextBridge.exposeInMainWorld("languageAPI", {
  onSetLanguage: cb => ipcRenderer.on("lang:*", (e, lang) => cb(lang))
});

contextBridge.exposeInMainWorld("languageAPI", {
  onSetLanguage: cb =>
    ipcRenderer.on("language:set", (_event, languageId) => cb(languageId))
});
