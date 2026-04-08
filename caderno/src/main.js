const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New Tab', accelerator: 'Ctrl+T', click: () => mainWindow.webContents.send('tab:new') },
        { label: 'Open', accelerator: 'Ctrl+O', click: () => mainWindow.webContents.send('file:open') },
        { label: 'Save', accelerator: 'Ctrl+S', click: () => mainWindow.webContents.send('file:save') },
        { role: 'quit' }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
}

// IPC OPEN
ipcMain.handle('open-file', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openFile'] })
  if (r.canceled) return null
  return {
    path: r.filePaths[0],
    content: fs.readFileSync(r.filePaths[0], 'utf8')
  }
})

// IPC SAVE
ipcMain.handle('save-file', async (_, data) => {
  let filePath = data.path
  if (!filePath) {
    const r = await dialog.showSaveDialog({})
    if (r.canceled) return null
    filePath = r.filePath
  }
  fs.writeFileSync(filePath, data.content, 'utf8')
  return filePath
})

app.on('ready', createWindow)
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())