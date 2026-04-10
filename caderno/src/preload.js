const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onNewTab: (cb) => ipcRenderer.on("tab:new", cb),
  onCloseTab: (cb) => ipcRenderer.on("tab:close", cb),
  onOpen: (cb) => ipcRenderer.on("file:open", cb),
  onSave: (cb) => ipcRenderer.on("file:save", cb),

  openFile: () => ipcRenderer.invoke("open-file"),
  saveFile: (data) => ipcRenderer.invoke("save-file", data),
  // ✅ Recent Files
  updateRecentFiles: (list) => ipcRenderer.send("recent-files:update", list),
  // ✅ novo
  openFileByPath: (filePath) =>
    ipcRenderer.invoke("open-file-by-path", filePath),

  onOpenRecentFile: (cb) =>
    ipcRenderer.on("recent-files:open", (_, filePath) => cb(filePath)),
});

contextBridge.exposeInMainWorld("sessionAPI", {
  load: () => ipcRenderer.invoke("session:load"),
});

contextBridge.exposeInMainWorld("sessionBridge", {
  onRequestSave: (cb) => ipcRenderer.on("session:request-save", cb),
  saveToMain: (session) =>
    ipcRenderer.invoke("session:save-from-renderer", session),
});

contextBridge.exposeInMainWorld("viewAPI", {
  onToggleWordWrap: (cb) => ipcRenderer.on("view:toggle-word-wrap", cb),

  updateWordWrapState: (enabled) =>
    ipcRenderer.send("view:word-wrap-updated", enabled),
});

contextBridge.exposeInMainWorld("editorAPI", {
  onFormatDocument: (cb) => ipcRenderer.on("editor:format-document", cb),
});
contextBridge.exposeInMainWorld("languageAPI", {
  onSetLanguage: (cb) => ipcRenderer.on("language:set", (_, lang) => cb(lang)),

  updateLanguageMenu: (lang) => ipcRenderer.send("language:update-menu", lang),
});
