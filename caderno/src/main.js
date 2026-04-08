const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New Tab', accelerator: 'Ctrl+T', click: () => mainWindow.webContents.send('tab:new') },
        { label: 'Open', accelerator: 'Ctrl+O', click: () => mainWindow.webContents.send('file:open') },
        { label: 'Save', accelerator: 'Ctrl+S', click: () => mainWindow.webContents.send('file:save') },
        { label: 'Close Tab', accelerator: 'Ctrl+W', click: () => mainWindow.webContents.send('tab:close') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

/* =========================
   OPEN / SAVE
========================= */

ipcMain.handle('open-file', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (r.canceled) return null;

  const filePath = r.filePaths[0];
  return {
    path: filePath,
    content: fs.readFileSync(filePath, 'utf8')
  };
});

ipcMain.handle('save-file', async (_, data) => {
  let filePath = data.path;
  if (!filePath) {
    const r = await dialog.showSaveDialog({});
    if (r.canceled) return null;
    filePath = r.filePath;
  }
  fs.writeFileSync(filePath, data.content, 'utf8');
  return filePath;
});

/* =========================
   SESSION
========================= */

const sessionFile = () =>
  path.join(app.getPath('userData'), 'session.json');

ipcMain.handle('session:save', (_, session) => {
  fs.writeFileSync(sessionFile(), JSON.stringify(session, null, 2), 'utf8');
  return true;
});

ipcMain.handle('session:load', () => {
  if (!fs.existsSync(sessionFile())) return null;
  return JSON.parse(fs.readFileSync(sessionFile(), 'utf8'));
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});