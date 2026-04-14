import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";
import TabManager from "../core/editor/TabManager.js";
import SessionManager from "../core/session/SessionManager.js";
import { SmartNewTabFeature } from "../features/smart-new-tab/SmartNewTabFeature.js";

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
  const restored = session.load();

  if (restored.length > 0) {
    restored.forEach(d => tabManager.open(d));
    activateDocument(tabManager.getActive());
  } else {
    const doc = tabManager.createNew(
      smartNewTab.handleNewDocument
    );
    activateDocument(doc);
  }

  /* ============================
   * New Tab Button
   * ============================ */
  newTabBtn.addEventListener("click", () => {
    const doc = smartNewTab.handleNewDocument(
      name => tabManager.createNew(name)
    );
    activateDocument(doc);
    session.save(tabManager.tabs);
  });

  /* ============================
   * Menu actions
   * ============================ */
  window.menu.onNewFile(() => {
    const doc = smartNewTab.handleNewDocument(
      name => tabManager.createNew(name)
    );
    activateDocument(doc);
    session.save(tabManager.tabs);
  });

  window.menu.onOpenFile(async () => {
    const doc = await fsService.open();
    if (!doc) return;
    tabManager.open(doc);
    activateDocument(doc);
    session.save(tabManager.tabs);
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
    session.save(tabManager.tabs);
  });

  /* ============================
   * Config menu
   * ============================ */
  window.config.onToggleSmartNewTab(enabled => {
    smartNewTab.setEnabled(enabled);
  });

  /* ============================
   * Render Tabs
   * ============================ */
  function renderTabs() {
    tabContainer.innerHTML = "";

    tabManager.tabs.forEach(doc => {
      const tabEl = document.createElement("div");
      tabEl.classList.add("tab");

      const btn = document.createElement("button");
      btn.textContent =
        `${doc.getFileName()}${doc.isDirty() ? "*" : ""}`;

      if (doc === tabManager.getActive()) {
        btn.classList.add("active");
      }

      btn.onclick = () => activateDocument(doc);

      // ✅ Fechar aba com roda do mouse
      btn.addEventListener("mousedown", e => {
        if (e.button === 1) {
          e.preventDefault();
          tabManager.close(doc.id);
          activateDocument(tabManager.getActive());
          session.save(tabManager.tabs);
        }
      });

      const close = document.createElement("span");
      close.textContent = "×";
      close.classList.add("close");
      close.onclick = e => {
        e.stopPropagation();
        tabManager.close(doc.id);
        activateDocument(tabManager.getActive());
        session.save(tabManager.tabs);
      };

      tabEl.appendChild(btn);
      tabEl.appendChild(close);
      tabContainer.appendChild(tabEl);
    });

    // ✅ Drag & drop das abas
    if (window.Sortable) {
      Sortable.create(tabContainer, {
        animation: 150,
        onEnd: evt => {
          const [moved] = tabManager.tabs.splice(evt.oldIndex, 1);
          tabManager.tabs.splice(evt.newIndex, 0, moved);
          renderTabs();
        }
      });
    }
  }

  /* ============================
   * Atalhos da aplicação
   * ============================ */
  document.addEventListener("keydown", e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;

    switch (e.key) {
      case "n":
        e.preventDefault();
        window.menu.onNewFile();
        break;
      case "o":
        e.preventDefault();
        window.menu.onOpenFile();
        break;
      case "s":
        e.preventDefault();
        e.shiftKey
          ? window.menu.onSaveAsFile()
          : window.menu.onSaveFile();
        break;
      case "w":
        e.preventDefault();
        window.menu.onCloseTab();
        break;
      case "Tab":
        e.preventDefault();
        switchTab(e.shiftKey ? -1 : 1);
        break;
    }
  });

  function switchTab(direction) {
    const tabs = tabManager.tabs;
    if (tabs.length < 2) return;

    const index = tabs.indexOf(tabManager.getActive());
    const next =
      (index + direction + tabs.length) % tabs.length;
    activateDocument(tabs[next]);
  }
};
