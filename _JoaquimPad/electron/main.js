const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs/promises");

let mainWindow;

/* =====================================================
   WINDOW
   ===================================================== */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "_JoaquimPad",
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  mainWindow.webContents.on("did-finish-load", () => {
    createAppMenu();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* =====================================================
   MENU
   ===================================================== */
function createAppMenu() {
  if (!mainWindow) return;

  const template = [
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Novo",
          accelerator: "Ctrl+N",
          click: () => mainWindow.webContents.send("menu:file:new"),
        },
        {
          label: "Abrir…",
          accelerator: "Ctrl+O",
          click: () => mainWindow.webContents.send("menu:file:open"),
        },
        {
          label: "Salvar",
          accelerator: "Ctrl+S",
          click: () => mainWindow.webContents.send("menu:file:save"),
        },
        {
          label: "Salvar como…",
          accelerator: "Ctrl+Shift+S",
          click: () => mainWindow.webContents.send("menu:file:saveAs"),
        },
        {
          label: "Fechar aba",
          accelerator: "Ctrl+W",
          click: () => mainWindow.webContents.send("menu:file:closeTab"),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Linguagem",
      submenu: [
        { id: "javascript", label: "JavaScript" },
        { id: "typescript", label: "TypeScript" },
        { type: "separator" },

        { id: "python", label: "Python" },
        { id: "csharp", label: "C#" },
        { id: "java", label: "Java" },
        { type: "separator" },

        { id: "sql", label: "SQL" },
        { id: "json", label: "JSON" },
        { id: "yaml", label: "YAML" },
        { type: "separator" },

        { id: "html", label: "HTML" },
        { id: "css", label: "CSS" },
        { type: "separator" },

        { id: "c", label: "C" },
        { id: "cpp", label: "C++" },
        { id: "go", label: "Go" },
        { id: "rust", label: "Rust" },
        { id: "php", label: "PHP" },
        { id: "shell", label: "Shell" },
        { id: "markdown", label: "Markdown" },
      ].map((item) =>
        item.type === "separator"
          ? item
          : {
              label: item.label,
              click: () =>
                mainWindow.webContents.send("menu:view:setLanguage", item.id),
            },
      ),
    },
    {
      label: "Configurações",
      submenu: [
        {
          label: "Arquivo incremental",
          type: "checkbox",
          checked: true,
          click: (item) =>
            mainWindow.webContents.send("config:smart-new-tab", item.checked),
        },
      ],
    },
    {
      label: "Windows",
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
          checked: true,
          click: (item) =>
            mainWindow.webContents.send("menu:view:wordWrap", item.checked),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* =====================================================
   IPC – FILE SYSTEM
   ===================================================== */
ipcMain.handle("fs:open-dialog", async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("fs:save-dialog", async () => {
  if (!mainWindow) return null;

  const result = await dialog.showSaveDialog(mainWindow);
  return result.canceled ? null : result.filePath;
});

ipcMain.handle("fs:readFile", (_, filePath) => fs.readFile(filePath, "utf-8"));

ipcMain.handle("fs:writeFile", (_, filePath, content) =>
  fs.writeFile(filePath, content, "utf-8"),
);

ipcMain.handle("fs:stat", async (_, path) => {
  return fs.stat(path);
});

ipcMain.handle("fs:readFirstBytes", async (_, path, maxBytes = 1024 * 1024) => {
  const handle = await fs.open(path, "r");
  const buffer = Buffer.alloc(maxBytes);
  await handle.read(buffer, 0, maxBytes, 0);
  await handle.close();
  return buffer.toString("utf-8");
});

/* =====================================================
   APP LIFECYCLE
   ===================================================== */
app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", () => {
  BrowserWindow.getAllWindows().forEach((win) =>
    win.webContents.send("app:before-quit"),
  );
});
function sendLanguage(language) {
  mainWindow.webContents.send("menu:view:setLanguage", language);
}
