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

/**
 * ============================
 * Window
 * ============================
 */
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

  mainWindow.loadFile(
    path.join(__dirname, "../renderer/index.html")
  );

  /**
   * ⚠️ MENU SÓ É CRIADO
   * DEPOIS QUE O RENDERER CARREGAR
   */
  mainWindow.webContents.on("did-finish-load", () => {
    createAppMenu();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/**
 * ============================
 * Menu
 * ============================
 */
function createAppMenu() {
  const template = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Novo",
          accelerator: "Ctrl+N",
          click: () => {
            mainWindow.webContents.send("menu:file:new");
          }
        },
        {
          label: "Abrir…",
          accelerator: "Ctrl+O",
          click: () => {
            mainWindow.webContents.send("menu:file:open");
          }
        },
        {
          label: "Salvar",
          accelerator: "Ctrl+S",
          click: () => {
            mainWindow.webContents.send("menu:file:save");
          }
        },
        {
          label: "Salvar como…",
          accelerator: "Ctrl+Shift+S",
          click: () => {
            mainWindow.webContents.send("menu:file:saveAs");
          }
        },
        { type: "separator" },
        {
          label: "Sair",
          role: "quit"
        }
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
        { role: "togglefullscreen" }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * ============================
 * App lifecycle
 * ============================
 */
app.setName("_JoaquimPad");

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

/**
 * ============================
 * IPC - File System (CORE)
 * ============================
 */
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

ipcMain.handle("fs:readFile", (_, path) =>
  fs.readFile(path, "utf-8")
);

ipcMain.handle("fs:writeFile", (_, path, content) =>
  fs.writeFile(path, content, "utf-8")
);

ipcMain.handle("window:set-title", (_, title) => {
  mainWindow.setTitle(title);
});