import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";
import TabManager from "../core/editor/TabManager.js";
import SessionManager from "../core/session/SessionManager.js";
import { SmartNewTabFeature } from "../features/smart-new-tab/SmartNewTabFeature.js";
import { CursorNavigationFeature } from "../features/cursor-navigation/CursorNavigationFeature.js";
import { FileExplorerFeature } from "../features/file-explorer/FileExplorerFeature.js";
import { SearchFeature } from "../features/search/SearchFeature.js";
import { SidebarController } from "./ui/SidebarController.js";
import { TabView } from "./ui/TabView.js";

export function createEditor() {
  const editorContainer = document.getElementById("editor");
  const tabContainer = document.getElementById("tabs");
  const newTabBtn = document.getElementById("newTabBtn");
  const backBtn = document.getElementById("cursorBack");
  const forwardBtn = document.getElementById("cursorForward");
  const sidebarContainer = document.getElementById("sidebar");
  const resizer = document.getElementById("sidebar-resizer");

  let saveSession;

  const sidebarController = new SidebarController({
    sidebarContainer,
    resizer,
    onResizeEnd: () => saveSession?.(),
  }).init();

  EditorCore.init(editorContainer);

  const tabManager = new TabManager();
  const fsService = new FileSystemService();
  const session = new SessionManager();
  const statusBar = new StatusBar(EditorCore);

  statusBar.init();

  const fileExplorer = new FileExplorerFeature({
    fileSystem: fsService,
    tabManager,
  });

  fileExplorer.mount(sidebarContainer);

  const smartNewTab = new SmartNewTabFeature(tabManager, EditorCore);
  const cursorNav = new CursorNavigationFeature(EditorCore, tabManager);
  cursorNav.init();

  cursorNav.onStateChange(({ canGoBack, canGoForward }) => {
    backBtn.disabled = !canGoBack;
    forwardBtn.disabled = !canGoForward;
  });

  const tabView = new TabView({
    tabContainer,
    tabManager,
    cursorNav,
    activateDocument,
    saveSession: () => saveSession?.(),
  });

  const searchFeature = new SearchFeature({
    fileSystem: fsService,
    tabManager,
  });

  searchFeature.mount(document.body);

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "F") {
      e.preventDefault();
      searchFeature.open();
    }
  });

  window.config?.onToggleSmartNewTab((enabled) => {
    smartNewTab.setEnabled(enabled);
  });

  saveSession = () => {
    const width = sidebarController.getWidth();

    session.saveSnapshot({
      ...tabManager.getSnapshot(),
      cursorHistory: cursorNav.serialize(),
      openedFolder: fileExplorer?.controller?.currentFolder ?? null,
      sidebarWidth: width,
    });
  };

  function activateDocument(doc) {
    if (!doc) return;
    tabManager.setActive(doc);
    EditorCore.setDocument(doc);
    statusBar.bindDocument(doc);
    tabView.renderTabs();
  }

  const snapshot = session.loadSnapshot();

  if (snapshot?.sidebarWidth) {
    sidebarController.setWidth(snapshot.sidebarWidth);
  }

  if (snapshot) {
    if (snapshot.openedFolder) {
      sidebarController.show();
      fileExplorer.controller.initialize(snapshot.openedFolder);
    } else {
      sidebarController.hide();
    }
  } else {
    sidebarController.hide();
  }

  if (snapshot) {
    tabManager.restoreSnapshot(snapshot);

    if (snapshot.cursorHistory) {
      cursorNav.restore(snapshot.cursorHistory);
    }

    const active = tabManager.getActive();
    if (active) {
      activateDocument(active);
    }

    tabView.renderTabs();
  } else {
    const doc = tabManager.createNew("Untitled");
    activateDocument(doc);
    tabView.renderTabs();
  }

  window.menu?.onOpenFolder?.(async () => {
    console.log("Abrindo pasta...");

    const folder = await window.fs.openFolderDialog();

    if (!folder) {
      console.warn("Nenhuma pasta selecionada");
      return;
    }

    sidebarController.show();
    await fileExplorer.controller.initialize(folder);
    saveSession();
  });

  window.menu?.onCloseFolder?.(() => {
    console.log("Fechando pasta...");

    sidebarContainer.innerHTML = "";
    sidebarController.hide();
    saveSession();
  });

  newTabBtn.onclick = () => {
    const doc = smartNewTab.handleNewDocument((name) => tabManager.createNew(name));
    activateDocument(doc);
    saveSession();
  };

  backBtn.onclick = () => {
    if (!cursorNav.canGoBack()) return;
    cursorNav.back();
  };

  forwardBtn.onclick = () => {
    if (!cursorNav.canGoForward()) return;
    cursorNav.forward();
  };

  if (window.menu?.onNewFile) {
    window.menu.onNewFile(() => newTabBtn.onclick());
  }

  if (window.menu?.onOpenFile) {
    window.menu.onOpenFile(async () => {
      const doc = await fsService.open();
      if (!doc) return;
      tabManager.open(doc);
      activateDocument(doc);
      saveSession();
    });
  }

  if (window.menu?.onSaveFile) {
    window.menu.onSaveFile(() => {
      const doc = tabManager.getActive();
      if (doc) fsService.save(doc);
    });
  }

  if (window.menu?.onSaveAsFile) {
    window.menu.onSaveAsFile(() => {
      const doc = tabManager.getActive();
      if (doc) fsService.saveAs(doc);
    });
  }

  if (window.menu?.onSetLanguage) {
    window.menu.onSetLanguage((language) => {
      const doc = tabManager.getActive();
      if (!doc) return;

      doc.setLanguage(language);
      EditorCore.setLanguage(language);
      EditorCore.refreshModelLanguage?.();
      tabView.renderTabs();
      saveSession();
    });
  }

  window.appLifecycle?.onBeforeQuit(() => saveSession());
}
