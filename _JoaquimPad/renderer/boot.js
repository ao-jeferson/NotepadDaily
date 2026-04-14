import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";
import TabManager from "../core/editor/TabManager.js";
import SessionManager from "../core/session/SessionManager.js";
import { SmartNewTabFeature } from "../features/smart-new-tab/SmartNewTabFeature.js";
import { CursorNavigationFeature } from "../features/cursor-navigation/CursorNavigationFeature.js";

window.createEditor = () => {
  const editorContainer = document.getElementById("editor");
  const tabContainer = document.getElementById("tabs");
  const newTabBtn = document.getElementById("newTabBtn");

  /* ============================
   * Core / Services
   * ============================ */
  EditorCore.init(editorContainer);

  const tabManager = new TabManager();
  const fsService = new FileSystemService();
  const session = new SessionManager();

  const statusBar = new StatusBar(EditorCore);
  statusBar.init();

  const smartNewTab = new SmartNewTabFeature(tabManager, EditorCore);

  const cursorNav = new CursorNavigationFeature(EditorCore, tabManager);
  cursorNav.init();

  /* ============================
   * Session persistence (✅ CENTRALIZADO)
   * ============================ */
  function saveSession() {
    session.save(tabManager.tabs);
    session.saveCursorHistory(cursorNav.serialize());
  }

  /* ============================
   * Helpers
   * ============================ */
  function activateDocument(doc) {
    if (!doc) return;

    tabManager.setActive(doc);
    EditorCore.setDocument(doc);
    statusBar.bindDocument(doc);
    renderTabs();
  }

  /* ============================
   * Restore session
   * ============================ */
  /* ============================
   * Restore session (CORRETO)
   * ============================ */
  const restored = session.load();

  if (restored.length > 0) {
    restored.forEach((d) => tabManager.open(d));
    activateDocument(tabManager.getActive());
  } else {
    // ✅ documento inicial neutro
    const doc = tabManager.createNew("Untitled");
    activateDocument(doc);
  }
  const cursorHistory = session.loadCursorHistory();
  cursorNav.restore(cursorHistory);

  /* ============================
   * New Tab Button
   * ============================ */
  newTabBtn.addEventListener("click", () => {
    const doc = smartNewTab.handleNewDocument((name) =>
      tabManager.createNew(name),
    );
    activateDocument(doc);
    saveSession();
  });
  /* ============================
   * Menu actions
   * ============================ */

  window.menu.onNewFile(() => {
    const doc = smartNewTab.handleNewDocument((name) =>
      tabManager.createNew(name),
    );
    activateDocument(doc);
    saveSession();
  });

  window.menu.onOpenFile(async () => {
    const doc = await fsService.open();
    if (!doc) return;

    tabManager.open(doc);
    activateDocument(doc);
    saveSession();
  });

  window.menu.onSaveFile(() => {
    const doc = tabManager.getActive();
    if (doc) fsService.save(doc);
  });

  window.menu.onSaveAsFile(() => {
    const doc = tabManager.getActive();
    if (doc) fsService.saveAs(doc);
  });

  window.menu.onCloseTab(() => {
    const active = tabManager.getActive();
    if (!active) return;

    tabManager.close(active.id);
    activateDocument(tabManager.getActive());
    saveSession();
  });

  /* ============================
   * Config menu
   * ============================ */
  window.config.onToggleSmartNewTab((enabled) => {
    smartNewTab.setEnabled(enabled);
  });

  /* ============================
   * Cursor navigation buttons
   * ============================ */
  document
    .getElementById("cursorBack")
    .addEventListener("click", () => cursorNav.back());

  document
    .getElementById("cursorForward")
    .addEventListener("click", () => cursorNav.forward());

  /* ============================
   * Render Tabs
   * ============================ */
  function renderTabs() {
    tabContainer.innerHTML = "";

    tabManager.tabs.forEach((doc) => {
      const tabEl = document.createElement("div");
      tabEl.classList.add("tab");

      const btn = document.createElement("button");
      btn.textContent = `${doc.getFileName()}${doc.isDirty() ? "*" : ""}`;

      if (doc === tabManager.getActive()) {
        btn.classList.add("active");
      }

      btn.onclick = () => activateDocument(doc);

      btn.addEventListener("mousedown", (e) => {
        if (e.button === 1) {
          e.preventDefault();
          tabManager.close(doc.id);
          activateDocument(tabManager.getActive());
          saveSession();
        }
      });

      const close = document.createElement("span");
      close.textContent = "×";
      close.classList.add("close");
      close.onclick = (e) => {
        e.stopPropagation();
        tabManager.close(doc.id);
        activateDocument(tabManager.getActive());
        saveSession();
      };

      tabEl.appendChild(btn);
      tabEl.appendChild(close);
      tabContainer.appendChild(tabEl);
    });

    if (window.Sortable) {
      Sortable.create(tabContainer, {
        animation: 150,
        onEnd: (evt) => {
          const [moved] = tabManager.tabs.splice(evt.oldIndex, 1);
          tabManager.tabs.splice(evt.newIndex, 0, moved);
          renderTabs();
          saveSession();
        },
      });
    }
  }

  /* ============================
   * App lifecycle (✅ CORRETO PARA ELECTRON)
   * ============================ */

  function saveSession() {
    console.log("[SESSION] saveSession()");
    session.save(tabManager.tabs);
    session.saveCursorHistory(cursorNav.serialize());
  }

  window.appLifecycle?.onBeforeQuit(() => {
    console.log("[SESSION] before-quit recebido");
    saveSession();
  });
};
