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
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  let wordWrapEnabled = true;

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
            label: "Save",
            accelerator: "Ctrl+S",
            click: () => win.webContents.send("file:save"),
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
            click: () => win.webContents.send("view:toggle-word-wrap"),
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
          {
            label: "Plain Text",
            type: "radio",
            click: () => win.webContents.send("language:set", "plaintext"),
          },
          {
            label: "JavaScript",
            type: "radio",
            click: () => win.webContents.send("language:set", "javascript"),
          },
          {
            label: "TypeScript",
            type: "radio",
            click: () => win.webContents.send("language:set", "typescript"),
          },
          {
            label: "JSON",
            type: "radio",
            click: () => win.webContents.send("language:set", "json"),
          },
          {
            label: "HTML",
            type: "radio",
            click: () => win.webContents.send("language:set", "html"),
          },
          {
            label: "CSS",
            type: "radio",
            click: () => win.webContents.send("language:set", "css"),
          },
          {
            label: "Markdown",
            type: "radio",
            click: () => win.webContents.send("language:set", "markdown"),
          },
          {
            label: "Python",
            type: "radio",
            click: () => win.webContents.send("language:set", "python"),
          },
          {
            label: "Java",
            type: "radio",
            click: () => win.webContents.send("language:set", "java"),
          },
          {
            label: "C#",
            type: "radio",
            click: () => win.webContents.send("language:set", "csharp"),
          },
          {
            label: "SQL",
            type: "radio",
            click: () => win.webContents.send("language:set", "sql"),
          },
          {
            label: "XML",
            type: "radio",
            click: () => win.webContents.send("language:set", "xml"),
          },
        ],
      },
      { role: "viewMenu" },
      { role: "windowMenu" },
      { role: "helpMenu" },
    ]);
  }

  Menu.setApplicationMenu(buildMenu(win));

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
// ipcMain.on("view:word-wrap-updated", (_, enabled) => {
//   wordWrapEnabled = enabled;
//   Menu.setApplicationMenu(buildMenu(win)); // 🔄 atualiza ✓
// });

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
