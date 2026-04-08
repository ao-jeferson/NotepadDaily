const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let win;
let isClosing = false;

const sessionFile = () => path.join(app.getPath("userData"), "session.json");

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#ffffff",
    title: "Caderno",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  /* ===== MENUS ===== */
  const menu = Menu.buildFromTemplate([
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
          label: "Save",
          accelerator: "Ctrl+S",
          click: () => win.webContents.send("file:save"),
        },
        {
          label: "Close Tab",
          accelerator: "Ctrl+W",
          click: () => win.webContents.send("tab:close"),
        },
        { type: "separator" },
        { label: "Quit", accelerator: "Alt+F4", click: () => win.close() },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Format Document",
          accelerator: "Ctrl+K Ctrl+D",
          click: () => win.webContents.send("editor:format-document"),
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  /* ===== SESSÃO NO FECHAMENTO ===== */
  win.on("close", (e) => {
    if (isClosing) return;

    e.preventDefault();
    win.webContents.send("session:request-save");

    // fallback de segurança
    setTimeout(() => {
      if (!isClosing) {
        isClosing = true;
        win.close();
      }
    }, 800);
  });
}

/* ===== FILE IO ===== */

ipcMain.handle("open-file", async () => {
  const r = await dialog.showOpenDialog({ properties: ["openFile"] });
  if (r.canceled) return null;

  const file = r.filePaths[0];
  return { path: file, content: fs.readFileSync(file, "utf8") };
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

/* ===== SESSION ===== */

ipcMain.handle("session:load", () => {
  if (!fs.existsSync(sessionFile())) return null;
  return JSON.parse(fs.readFileSync(sessionFile(), "utf8"));
});

ipcMain.handle("session:save-from-renderer", (_, session) => {
  fs.writeFileSync(sessionFile(), JSON.stringify(session, null, 2), "utf8");
  isClosing = true;
  win.close();
});

/* ===== APP ===== */

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
