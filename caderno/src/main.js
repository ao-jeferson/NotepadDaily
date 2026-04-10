const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let win;
let isClosing = false;
let recentFiles = [];
let wordWrapEnabled = true;

/* =========================================================
   SESSION FILE
========================================================= */

const sessionFile = () => path.join(app.getPath("userData"), "session.json");

/* =========================================================
   RECENT FILES MENU
========================================================= */
const RECENT_FILES_PATH = path.join(
  app.getPath("userData"),
  "recent-files.json",
);

function buildRecentFilesMenu(win) {
  if (!recentFiles.length) {
    return [{ label: "No Recent Files", enabled: false }];
  }

  return recentFiles.map((filePath) => ({
    label: path.basename(filePath), // ✅ só o nome
    toolTip: filePath, // ✅ path completo
    click: () => {
      win.webContents.send("recent-files:open", filePath);
    },
  }));
}
function loadRecentFiles() {
  if (!fs.existsSync(RECENT_FILES_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(RECENT_FILES_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveRecentFiles() {
  fs.writeFileSync(
    RECENT_FILES_PATH,
    JSON.stringify(recentFiles, null, 2),
    "utf8",
  );
}
``;
/* =========================================================
   APPLICATION MENU
========================================================= */
function buildMenu(win) {
  return Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "New Tab",
          accelerator: "Ctrl+T",
          click: () => win.webContents.send("tab:new"),
        },
        {
          label: "Open",
          accelerator: "Ctrl+O",
          click: () => win.webContents.send("file:open"),
        },
        {
          label: "Open Folder",
          accelerator: "Ctrl+K Ctrl+O",
          click: () => {
            if (win && !win.isDestroyed()) {
              win.webContents.send("workspace:open");
            }
          },
        },
        {
          label: "Save",
          accelerator: "Ctrl+S",
          click: () => win.webContents.send("file:save"),
        },

        { type: "separator" },
        {
          label: "Recent Files",
          submenu: [
            ...buildRecentFilesMenu(win),
            { type: "separator" },
            {
              label: "Clear Recent Files",
              click: () => {
                recentFiles = [];
                saveRecentFiles();
                Menu.setApplicationMenu(buildMenu(win));
              },
            },
          ],
        },
        { type: "separator" },

        { role: "quit" },
      ],
    },

    {
      label: "Edit",
      submenu: [
        {
          label: "Word Wrap",
          type: "checkbox",
          checked: wordWrapEnabled,
          accelerator: "Alt+Z",
          click: () => {
            wordWrapEnabled = !wordWrapEnabled;
            win.webContents.send("view:toggle-word-wrap", wordWrapEnabled);
          },
        },
        {
          label: "Format Document",
          accelerator: "Ctrl+K Ctrl+D",
          click: () => win.webContents.send("editor:format-document"),
        },
      ],
    },

    {
      label: "Language",
      submenu: [
        "plaintext",
        "javascript",
        "typescript",
        "json",
        "html",
        "css",
        "markdown",
        "python",
        "java",
        "csharp",
        "sql",
        "xml",
      ].map((lang) => ({
        label: lang.toUpperCase(),
        type: "radio",
        click: () => win.webContents.send("language:set", lang),
      })),
    },

    { role: "viewMenu" },
    { role: "windowMenu" },
    { role: "helpMenu" },
  ]);
}

/* =========================================================
   CREATE WINDOW
========================================================= */
function createWindow() {
  win = new BrowserWindow({
    width: 1500,
    height: 1000,
    backgroundColor: "#ffffff",
    title: "Caderno",
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  recentFiles = loadRecentFiles();
  Menu.setApplicationMenu(buildMenu(win));

  /* ----- SESSION ON CLOSE ----- */
  win.on("close", (e) => {
    if (isClosing) return;

    e.preventDefault();
    win.webContents.send("session:request-save");

    setTimeout(() => {
      if (!isClosing) {
        isClosing = true;
        win.close();
      }
    }, 800);
  });
}

/* =========================================================
   FILE IO
========================================================= */
ipcMain.handle("open-file", async () => {
  const r = await dialog.showOpenDialog({
    properties: ["openFile"],
  });

  if (r.canceled) return null;
  const file = r.filePaths[0];
  return {
    path: file,
    content: fs.readFileSync(file, "utf8"),
  };
});

ipcMain.handle("save-file", async (_, data) => {
  let p = data.path;

  if (!p) {
    const r = await dialog.showSaveDialog({});
    if (r.canceled) return null;
    p = r.filePath;
  }

  fs.writeFileSync(p, data.content, "utf8");
  return p;
});
ipcMain.handle("open-file-by-path", async (_, filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    return {
      path: filePath,
      content: fs.readFileSync(filePath, "utf8"),
    };
  } catch (err) {
    console.error("Erro ao abrir arquivo recente:", err);
    return null;
  }
});

/* =========================================================
   RECENT FILES UPDATE
========================================================= */

ipcMain.on("recent-files:update", (_, list) => {
  recentFiles = Array.isArray(list) ? list.slice(0, 20) : [];
  saveRecentFiles();

  if (win && !win.isDestroyed()) {
    Menu.setApplicationMenu(buildMenu(win));
  }
});

/* =========================================================
   SESSION SAVE / LOAD
========================================================= */
ipcMain.handle("session:load", () => {
  if (!fs.existsSync(sessionFile())) return null;
  return JSON.parse(fs.readFileSync(sessionFile(), "utf8"));
});

ipcMain.handle("session:save-from-renderer", (_, session) => {
  fs.writeFileSync(sessionFile(), JSON.stringify(session, null, 2), "utf8");
  isClosing = true;
  win.close();
});

/* =========================================================
   APP
========================================================= */
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function readDirectoryRecursive(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return {
        type: "folder",
        name: entry.name,
        path: fullPath,
        children: readDirectoryRecursive(fullPath),
      };
    }
    return {
      type: "file",
      name: entry.name,
      path: fullPath,
    };
  });
}

ipcMain.handle("workspace:open", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled) return null;

  const root = result.filePaths[0];
  return {
    root,
    tree: readDirectoryRecursive(root),
  };
});
