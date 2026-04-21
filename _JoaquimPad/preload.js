// preload.js

const {
  contextBridge,
  ipcRenderer,
  webFrame
} = require("electron");

/* =====================================================
   ZOOM (Ctrl + Scroll)
   ===================================================== */

window.addEventListener(
  "wheel",
  (e) => {

    if (e.ctrlKey) {

      e.preventDefault();

      const zoom =
        webFrame.getZoomLevel();

      webFrame.setZoomLevel(
        e.deltaY < 0
          ? zoom + 0.1
          : zoom - 0.1
      );

    }

  },
  { passive: false }
);

/* =====================================================
   FILE SYSTEM (UNIFICADO)
   ===================================================== */

contextBridge.exposeInMainWorld(
  "fs",
  {

    /* ======================
       FILE DIALOGS
       ====================== */

    openDialog: () =>
      ipcRenderer.invoke(
        "fs:open-dialog"
      ),

    openFolderDialog: () =>
      ipcRenderer.invoke(
        "fs:open-folder"
      ),

    saveDialog: () =>
      ipcRenderer.invoke(
        "fs:save-dialog"
      ),

    /* ======================
       FILE OPERATIONS
       ====================== */

    readFile: (path) =>
      ipcRenderer.invoke(
        "fs:readFile",
        path
      ),

    writeFile: (path, content) =>
      ipcRenderer.invoke(
        "fs:writeFile",
        path,
        content
      ),

    stat: (path) =>
      ipcRenderer.invoke(
        "fs:stat",
        path
      ),

    readFirstBytes:
      (path, maxBytes) =>
        ipcRenderer.invoke(
          "fs:readFirstBytes",
          path,
          maxBytes
        ),

    /* ======================
       DIRECTORY (Explorer)
       ====================== */

    readDir: (dir) =>
      ipcRenderer.invoke(
        "fs:readDir",
        dir
      )

  }
);

/* =====================================================
   MENU EVENTS
   ===================================================== */

contextBridge.exposeInMainWorld(
  "menu",
  {

    onNewFile: (cb) =>
      ipcRenderer.on(
        "menu:file:new",
        cb
      ),

    onOpenFile: (cb) =>
      ipcRenderer.on(
        "menu:file:open",
        cb
      ),

    onOpenFolder: (cb) =>
      ipcRenderer.on(
        "menu:folder:open",
        cb
      ),

    onCloseFolder: (cb) =>
      ipcRenderer.on(
        "menu:folder:close",
        cb
      ),

    onSaveFile: (cb) =>
      ipcRenderer.on(
        "menu:file:save",
        cb
      ),

    onSaveAsFile: (cb) =>
      ipcRenderer.on(
        "menu:file:saveAs",
        cb
      ),

    onCloseTab: (cb) =>
      ipcRenderer.on(
        "menu:file:closeTab",
        cb
      )

  }
);
/* =====================================================
   CONFIG
   ===================================================== */

contextBridge.exposeInMainWorld(
  "config",
  {

    onToggleSmartNewTab:
      (cb) =>
        ipcRenderer.on(
          "config:smart-new-tab",
          (_, v) => cb(v)
        )

  }
);

/* =====================================================
   LIFECYCLE
   ===================================================== */

contextBridge.exposeInMainWorld(
  "appLifecycle",
  {

    onBeforeQuit:
      (cb) =>
        ipcRenderer.on(
          "app:before-quit",
          cb
        ),

    saveSession: () =>
      ipcRenderer.send(
        "renderer:save-session"
      )

  }
);