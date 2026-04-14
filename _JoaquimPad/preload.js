const { contextBridge, ipcRenderer } = require("electron");
const { webFrame } = require('electron');

window.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();

    // pega o nível atual
    let currentZoom = webFrame.getZoomLevel();

    if (e.deltaY < 0) {
      webFrame.setZoomLevel(currentZoom + 0.1); // zoom in
    } else {
      webFrame.setZoomLevel(currentZoom - 0.1); // zoom out
    }
  }
}, { passive: false });

contextBridge.exposeInMainWorld("menu", {
  onNewFile: (cb) => ipcRenderer.on("menu:file:new", cb),
  onOpenFile: (cb) => ipcRenderer.on("menu:file:open", cb),
  onSaveFile: (cb) => ipcRenderer.on("menu:file:save", cb),
  onSaveAsFile: (cb) => ipcRenderer.on("menu:file:saveAs", cb),
  onCloseTab: (cb) => ipcRenderer.on("menu:file:closeTab", cb),
  onToggleWordWrap: (cb) => ipcRenderer.on("menu:view:wordWrap", (_, checked) => cb(checked)),
  onSetLanguage: (cb) => ipcRenderer.on("menu:view:setLanguage", (_, lang) => cb(lang)),
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
contextBridge.exposeInMainWorld("config", {
  onToggleSmartNewTab: (cb) =>
    ipcRenderer.on("config:smart-new-tab", (_, v) => cb(v))
});