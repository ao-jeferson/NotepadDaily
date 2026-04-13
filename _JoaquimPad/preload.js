const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fs", {
  readFile: (path) =>
    ipcRenderer.invoke("fs:readFile", path),

  writeFile: (path, content) =>
    ipcRenderer.invoke("fs:writeFile", path, content)
});