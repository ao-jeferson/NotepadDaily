const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs/promises");

let mainWindow;

/**
 * ============================
 * Window creation
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

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/**
 * ============================
 * App lifecycle
 * ============================
 */
app.setName("_JoaquimPad");

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * ============================
 * IPC - File System (CORE)
 * ============================
 */

/**
 * Open file dialog
 */
ipcMain.handle("fs:open-dialog", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Text files", extensions: ["txt", "js", "ts", "json", "md"] },
      { name: "All files", extensions: ["*"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

/**
 * Save file dialog
 */
ipcMain.handle("fs:save-dialog", async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: "Text files", extensions: ["txt"] },
      { name: "All files", extensions: ["*"] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
});

/**
 * Read file content
 */
ipcMain.handle("fs:readFile", async (_, filePath) => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err) {
    console.error("Error reading file:", err);
    throw err;
  }
});

/**
 * Write file content
 */
ipcMain.handle("fs:writeFile", async (_, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing file:", err);
    throw err;
  }
});

/**
 * ============================
 * IPC - App / Window helpers
 * ============================
 */

ipcMain.handle("app:get-info", () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform
  };
});

ipcMain.handle("window:set-title", (_, title) => {
  if (mainWindow) {
    mainWindow.setTitle(title);
  }
});