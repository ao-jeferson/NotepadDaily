const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#ffffff",
    autoHideMenuBar: false, // mantém menu visível
    title: "Caderno",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));

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
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Compare with Previous Tab",
          click: () => win.webContents.send("diff:previous"),
        },
        { label: "Exit Diff", click: () => win.webContents.send("diff:exit") },
      ],
    },
    {
      label: "Language",
      submenu: [
        {
          label: "Plain Text",
          click: () => win.webContents.send("language:set", "plaintext"),
        },
        { type: "separator" },
        {
          label: "JavaScript",
          click: () => win.webContents.send("language:set", "javascript"),
        },
        {
          label: "TypeScript",
          click: () => win.webContents.send("language:set", "typescript"),
        },
        {
          label: "HTML",
          click: () => win.webContents.send("language:set", "html"),
        },
        {
          label: "CSS",
          click: () => win.webContents.send("language:set", "css"),
        },
        {
          label: "JSON",
          click: () => win.webContents.send("language:set", "json"),
        },
        {
          label: "Markdown",
          click: () => win.webContents.send("language:set", "markdown"),
        },
        {
          label: "Python",
          click: () => win.webContents.send("language:set", "python"),
        },
        {
          label: "C#",
          click: () => win.webContents.send("language:set", "csharp"),
        },
        {
          label: "Java",
          click: () => win.webContents.send("language:set", "java"),
        },
        {
          label: "SQL",
          click: () => win.webContents.send("language:set", "sql"),
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

/* ================= FILE IO ================== */

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

/* ================= SESSION ================== */

const sessionFile = () => path.join(app.getPath("userData"), "session.json");

ipcMain.handle("session:save", (_, session) => {
  fs.writeFileSync(sessionFile(), JSON.stringify(session, null, 2), "utf8");
  return true;
});

ipcMain.handle("session:load", () => {
  if (!fs.existsSync(sessionFile())) return null;
  return JSON.parse(fs.readFileSync(sessionFile(), "utf8"));
});

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
