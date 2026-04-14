const { contextBridge, ipcRenderer, webFrame } = require("electron");

/* =====================================================
   ZOOM (Ctrl + Scroll)
   ===================================================== */
window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoom = webFrame.getZoomLevel();
      webFrame.setZoomLevel(e.deltaY < 0 ? zoom + 0.1 : zoom - 0.1);
    }
  },
  { passive: false },
);

/* =====================================================
   FILE SYSTEM (APENAS IPC)
   ===================================================== */
contextBridge.exposeInMainWorld("fs", {
  openDialog: () => ipcRenderer.invoke("fs:open-dialog"),

  saveDialog: () => ipcRenderer.invoke("fs:save-dialog"),

  readFile: (path) => ipcRenderer.invoke("fs:readFile", path),

  writeFile: (path, content) =>
    ipcRenderer.invoke("fs:writeFile", path, content),

  stat: (path) => ipcRenderer.invoke("fs:stat", path),

  readFirstBytes: (path, maxBytes) =>
    ipcRenderer.invoke("fs:readFirstBytes", path, maxBytes),
});

/* =====================================================
   MENU EVENTS
   ===================================================== */
contextBridge.exposeInMainWorld("menu", {
  onNewFile: (cb) => ipcRenderer.on("menu:file:new", cb),
  onOpenFile: (cb) => ipcRenderer.on("menu:file:open", cb),
  onSaveFile: (cb) => ipcRenderer.on("menu:file:save", cb),
  onSaveAsFile: (cb) => ipcRenderer.on("menu:file:saveAs", cb),
  onCloseTab: (cb) => ipcRenderer.on("menu:file:closeTab", cb),
  onSetLanguage: (cb) =>
    ipcRenderer.on("menu:view:setLanguage", (_, lang) => cb(lang)),
});

/* =====================================================
   CONFIG
   ===================================================== */
contextBridge.exposeInMainWorld("config", {
  onToggleSmartNewTab: (cb) =>
    ipcRenderer.on("config:smart-new-tab", (_, v) => cb(v)),
});

/* =====================================================
   LIFECYCLE
   ===================================================== */
contextBridge.exposeInMainWorld("appLifecycle", {
  onBeforeQuit: (cb) => ipcRenderer.on("app:before-quit", cb),
});

contextBridge.exposeInMainWorld("appLifecycle", {
  saveSession: () => ipcRenderer.send("renderer:save-session"),
});
