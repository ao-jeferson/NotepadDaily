const { contextBridge, ipcRenderer } = require("electron");

/**
 * ==========================
 * API PRINCIPAL
 * ==========================
 */
contextBridge.exposeInMainWorld("api", {
  // ---------- TABS ----------
  onNewTab: (cb) => ipcRenderer.on("tab:new", cb),
  onCloseTab: (cb) => ipcRenderer.on("tab:close", cb),

  // ---------- ARQUIVOS ----------
  onOpen: (cb) => ipcRenderer.on("file:open", cb),
  onSave: (cb) => ipcRenderer.on("file:save", cb),

  openFile: () => ipcRenderer.invoke("open-file"),
  openFileByPath: (filePath) =>
    ipcRenderer.invoke("open-file-by-path", filePath),
  saveFile: (data) =>
    ipcRenderer.invoke("save-file", data),

  // ---------- WORKSPACE ----------
  onOpenWorkspace: (cb) =>
    ipcRenderer.on("workspace:open", () => cb()),

  openWorkspace: () =>
    ipcRenderer.invoke("workspace:open"),

  // ---------- RECENT FILES ----------
  updateRecentFiles: (list) =>
    ipcRenderer.send("recent-files:update", list),

  onOpenRecentFile: (cb) =>
    ipcRenderer.on("recent-files:open", (_, filePath) => cb(filePath)),
});

/**
 * ==========================
 * SESSÃO
 * ==========================
 */
contextBridge.exposeInMainWorld("sessionAPI", {
  load: () => ipcRenderer.invoke("session:load"),
});

contextBridge.exposeInMainWorld("sessionBridge", {
  onRequestSave: (cb) =>
    ipcRenderer.on("session:request-save", cb),

  saveToMain: (session) =>
    ipcRenderer.invoke("session:save-from-renderer", session),
});

/**
 * ==========================
 * VIEW
 * ==========================
 */
contextBridge.exposeInMainWorld("viewAPI", {
  onToggleWordWrap: (cb) =>
    ipcRenderer.on("view:toggle-word-wrap", cb),

  updateWordWrapState: (enabled) =>
    ipcRenderer.send("view:word-wrap-updated", enabled),
});

/**
 * ==========================
 * EDITOR
 * ==========================
 */
contextBridge.exposeInMainWorld("editorAPI", {
  onFormatDocument: (cb) =>
    ipcRenderer.on("editor:format-document", cb),
});

/**
 * ==========================
 * LINGUAGEM
 * ==========================
 */
contextBridge.exposeInMainWorld("languageAPI", {
  onSetLanguage: (cb) =>
    ipcRenderer.on("language:set", (_, lang) => cb(lang)),

  updateLanguageMenu: (lang) =>
    ipcRenderer.send("language:update-menu", lang),
});