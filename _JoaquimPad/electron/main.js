const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} = require("electron");

const path = require("path");
const fs = require("fs/promises");

/* =====================================================
   GLOBALS
   ===================================================== */

let mainWindow = null;

let currentLanguage = "javascript";

/* =====================================================
   ICON HELPER
   ===================================================== */

function getIcon(name) {

  return path.join(
    __dirname,
    "assets",
    "icons",
    `${name}.png`
  );

}

/* =====================================================
   LANGUAGE CONFIG
   ===================================================== */

const LANGUAGES = [

  { id: "javascript", label: "JavaScript", icon: "js" },
  { id: "typescript", label: "TypeScript", icon: "ts" },

  { type: "separator" },

  { id: "python", label: "Python", icon: "python" },
  { id: "csharp", label: "C#", icon: "csharp" },
  { id: "java", label: "Java", icon: "java" },

  { type: "separator" },

  { id: "sql", label: "SQL", icon: "sql" },
  { id: "json", label: "JSON", icon: "json" },
  { id: "yaml", label: "YAML", icon: "yaml" },

  { type: "separator" },

  { id: "html", label: "HTML", icon: "html" },
  { id: "css", label: "CSS", icon: "css" },

  { type: "separator" },

  { id: "c", label: "C", icon: "c" },
  { id: "cpp", label: "C++", icon: "cpp" },
  { id: "go", label: "Go", icon: "go" },
  { id: "rust", label: "Rust", icon: "rust" },
  { id: "php", label: "PHP", icon: "php" },
  { id: "shell", label: "Shell", icon: "shell" },
  { id: "markdown", label: "Markdown", icon: "markdown" }

];

/* =====================================================
   WINDOW
   ===================================================== */

function createMainWindow() {

  mainWindow = new BrowserWindow({

    width: 1200,
    height: 800,

    webPreferences: {

      preload: path.join(
        __dirname,
        "../preload.js"
      ),

      contextIsolation: true,
      nodeIntegration: false

    }

  });

  mainWindow.loadFile(
    path.join(
      __dirname,
      "../renderer/index.html"
    )
  );

  /* ⭐ IMPORTANTE */

  mainWindow.webContents.on(
    "did-finish-load",
    () => {

      createAppMenu();

    }
  );

}
/* =====================================================
   MENU
   ===================================================== */

function buildLanguageMenu() {

  return LANGUAGES.map(item => {

    if (item.type === "separator")
      return item;

    return {

      label: item.label,

      type: "radio",

      checked:
        currentLanguage === item.id,

      icon: getIcon(item.icon),

      click: () => {

        currentLanguage = item.id;

        mainWindow.webContents.send(
          "menu:view:setLanguage",
          item.id
        );

        createAppMenu();

      }

    };

  });

}

function createAppMenu() {

  if (!mainWindow) return;

  const template = [

    /* =========================
       FILE
       ========================= */

    {
      label: "File",

      submenu: [

        {
          label: "New",
          accelerator: "Ctrl+N",

          click: () =>
            mainWindow.webContents.send(
              "menu:file:new"
            )
        },

        {
          label: "Open File...",
          accelerator: "Ctrl+O",

          click: () =>
            mainWindow.webContents.send(
              "menu:file:open"
            )
        },

        {
          label: "Open Folder...",
          accelerator: "Ctrl+Shift+O",

          click: () =>
            mainWindow.webContents.send(
              "menu:folder:open"
            )
        },

        {
          label: "Close Folder",

          click: () =>
            mainWindow.webContents.send(
              "menu:folder:close"
            )
        },

        { type: "separator" },

        {
          label: "Save",
          accelerator: "Ctrl+S",

          click: () =>
            mainWindow.webContents.send(
              "menu:file:save"
            )
        },

        {
          label: "Save As...",
          accelerator: "Ctrl+Shift+S",

          click: () =>
            mainWindow.webContents.send(
              "menu:file:saveAs"
            )
        },

        {
          label: "Close Tab",
          accelerator: "Ctrl+W",

          click: () =>
            mainWindow.webContents.send(
              "menu:file:closeTab"
            )
        },

        { type: "separator" },

        {
          role: "quit",
          label: "Exit"
        }

      ]

    },

    /* =========================
       VIEW
       ========================= */

    {
      label: "View",

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

  const menu =
    Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);

}

/* =====================================================
   IPC – FILE SYSTEM
   ===================================================== */

/* -------- OPEN FILE -------- */

ipcMain.handle(
  "fs:open-dialog",
  async () => {

    const result =
      await dialog.showOpenDialog({

        properties: ["openFile"]

      });

    if (result.canceled)
      return null;

    return result.filePaths[0];

  }
);

/* -------- OPEN FOLDER ⭐ ESSENCIAL -------- */

ipcMain.handle(
  "fs:open-folder",
  async () => {

    const result =
      await dialog.showOpenDialog({

        properties: ["openDirectory"]

      });

    if (result.canceled)
      return null;

    return result.filePaths[0];

  }
);

/* -------- SAVE -------- */

ipcMain.handle(
  "fs:save-dialog",
  async () => {

    const result =
      await dialog.showSaveDialog();

    if (result.canceled)
      return null;

    return result.filePath;

  }
);

/* -------- READ FILE -------- */

ipcMain.handle(
  "fs:readFile",
  async (_, filePath) => {

    return fs.readFile(
      filePath,
      "utf-8"
    );

  }
);

/* -------- WRITE FILE -------- */

ipcMain.handle(
  "fs:writeFile",
  async (_, filePath, content) => {

    await fs.writeFile(
      filePath,
      content,
      "utf-8"
    );

  }
);

/* -------- STAT -------- */

ipcMain.handle(
  "fs:stat",
  async (_, filePath) => {

    const stat =
      await fs.stat(filePath);

    return {

      isFile:
        stat.isFile(),

      size:
        stat.size

    };

  }
);

/* -------- READ FIRST BYTES -------- */

ipcMain.handle(
  "fs:readFirstBytes",
  async (_, filePath, maxBytes = 1024 * 1024) => {

    const handle =
      await fs.open(filePath, "r");

    const buffer =
      Buffer.alloc(maxBytes);

    await handle.read(
      buffer,
      0,
      maxBytes,
      0
    );

    await handle.close();

    return buffer.toString("utf-8");

  }
);

/* -------- READ DIRECTORY ⭐ ESSENCIAL -------- */

ipcMain.handle(
  "fs:readDir",
  async (_, dir) => {

    const entries =
      await fs.readdir(dir, {
        withFileTypes: true
      });

    return entries.map(e => ({

      name: e.name,

      path:
        path.join(dir, e.name),

      isDirectory:
        e.isDirectory()

    }));

  }
);

/* =====================================================
   APP LIFECYCLE
   ===================================================== */

app.whenReady().then(
  createMainWindow
);

app.on(
  "window-all-closed",
  () => {

    if (
      process.platform !== "darwin"
    ) {

      app.quit();

    }

  }
);

app.on(
  "activate",
  () => {

    if (
      BrowserWindow.getAllWindows().length === 0
    ) {

      createMainWindow();

    }

  }
);

app.on(
  "before-quit",
  () => {

    BrowserWindow
      .getAllWindows()
      .forEach(win => {

        win.webContents.send(
          "app:before-quit"
        );

      });

  }
);