const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} = require("electron");

const path = require("path");
const fs = require("fs/promises");

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "_JoaquimPad",
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  mainWindow.webContents.on("did-finish-load", () => {
    createAppMenu();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createAppMenu() {
  const template = [
    {
      label: "Arquivo",
      submenu: [
        { label: "Novo", accelerator: "Ctrl+N", click: () => mainWindow.webContents.send("menu:file:new") },
        { label: "Abrir…", accelerator: "Ctrl+O", click: () => mainWindow.webContents.send("menu:file:open") },
        { label: "Salvar", accelerator: "Ctrl+S", click: () => mainWindow.webContents.send("menu:file:save") },
        { label: "Salvar como…", accelerator: "Ctrl+Shift+S", click: () => mainWindow.webContents.send("menu:file:saveAs") },
        { label: "Fechar aba", accelerator: "Ctrl+W", click: () => mainWindow.webContents.send("menu:file:closeTab") },
        { type: "separator" },
        { label: "Sair", role: "quit" }
      ]
    },
    {
      label: "Exibir",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { type: "separator" },
        {
          label: "Word Wrap",
          type: "checkbox",
          checked: true, // começa ligado
          click: (menuItem) => {
            mainWindow.webContents.send("menu:view:wordWrap", menuItem.checked);
          }
        }
      ]
    },{
      label: "Linguagem",
      submenu: [
        { label: "JavaScript", click: () => mainWindow.webContents.send("menu:view:setLanguage", "javascript") },
        { label: "TypeScript", click: () => mainWindow.webContents.send("menu:view:setLanguage", "typescript") },
        { label: "Python", click: () => mainWindow.webContents.send("menu:view:setLanguage", "python") },
        { label: "HTML", click: () => mainWindow.webContents.send("menu:view:setLanguage", "html") },
        { label: "CSS", click: () => mainWindow.webContents.send("menu:view:setLanguage", "css") },
        { label: "JSON", click: () => mainWindow.webContents.send("menu:view:setLanguage", "json") },
        { label: "Markdown", click: () => mainWindow.webContents.send("menu:view:setLanguage", "markdown") },
        { label: "C", click: () => mainWindow.webContents.send("menu:view:setLanguage", "c") },
        { label: "C++", click: () => mainWindow.webContents.send("menu:view:setLanguage", "cpp") },
        { label: "Java", click: () => mainWindow.webContents.send("menu:view:setLanguage", "java") },
        { label: "Go", click: () => mainWindow.webContents.send("menu:view:setLanguage", "go") },
        { label: "Rust", click: () => mainWindow.webContents.send("menu:view:setLanguage", "rust") },
        { label: "PHP", click: () => mainWindow.webContents.send("menu:view:setLanguage", "php") },
        { label: "SQL", click: () => mainWindow.webContents.send("menu:view:setLanguage", "sql") },
        { label: "Shell", click: () => mainWindow.webContents.send("menu:view:setLanguage", "shell") },
        { label: "YAML", click: () => mainWindow.webContents.send("menu:view:setLanguage", "yaml") }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


app.setName("_JoaquimPad");
app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// IPC - File System
ipcMain.handle("fs:open-dialog", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Text files", extensions: ["txt", "js", "ts", "json", "md"] },
      { name: "All files", extensions: ["*"] }
    ]
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("fs:save-dialog", async () => {
  const result = await dialog.showSaveDialog(mainWindow);
  return result.canceled ? null : result.filePath;
});

ipcMain.handle("fs:readFile", (_, path) => fs.readFile(path, "utf-8"));
ipcMain.handle("fs:writeFile", (_, path, content) => fs.writeFile(path, content, "utf-8"));

ipcMain.handle("window:set-title", (_, title) => {
  if (mainWindow) mainWindow.setTitle(title);
});
