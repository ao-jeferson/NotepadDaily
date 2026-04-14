import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";
import TabManager from "../core/editor/TabManager.js";
import SessionManager from "../core/session/SessionManager.js";
import { SmartNewTabFeature } from "../features/smart-new-tab/SmartNewTabFeature.js";
import { CursorNavigationFeature } from "../features/cursor-navigation/CursorNavigationFeature.js";

window.createEditor = () => {
  /* =====================================================
     DOM REFERENCES
     ===================================================== */
  const editorContainer = document.getElementById("editor");
  const tabContainer = document.getElementById("tabs");
  const newTabBtn = document.getElementById("newTabBtn");
  const backBtn = document.getElementById("cursorBack");
  const forwardBtn = document.getElementById("cursorForward");

  const languageIcons = {
    javascript: "🟨",
    typescript: "🟦",
    csharp: "🟪",
    json: "🟫",
    markdown: "📘",
    html: "🟥",
    css: "🟪",
    plaintext: "📄"
  };

  /* =====================================================
     CORE & SERVICES
     ===================================================== */
  EditorCore.init(editorContainer);

  const tabManager = new TabManager();
  const fsService = new FileSystemService();
  const session = new SessionManager();

  const statusBar = new StatusBar(EditorCore);
  statusBar.init();

  /* =====================================================
     FEATURES
     ===================================================== */
  const smartNewTab = new SmartNewTabFeature(tabManager, EditorCore);

  const cursorNav = new CursorNavigationFeature(EditorCore, tabManager);
  cursorNav.init();

  // ✅ UI reage ao estado da navegação (única ligação)
  cursorNav.onStateChange(({ canGoBack, canGoForward }) => {
    backBtn.disabled = !canGoBack;
    forwardBtn.disabled = !canGoForward;
  });

  /* =====================================================
     SESSION
     ===================================================== */
  const saveSession = () => {
    session.save(tabManager.tabs);
    session.saveCursorHistory(cursorNav.serialize());
  };

  /* =====================================================
     DOCUMENT ACTIVATION
     ===================================================== */
  const activateDocument = (doc) => {
    if (!doc) return;

    tabManager.setActive(doc);
    EditorCore.setDocument(doc);
    statusBar.bindDocument(doc);

    renderTabs();
  };

  /* =====================================================
     RESTORE SESSION
     ===================================================== */
  const restoredDocs = session.load();

  if (restoredDocs.length > 0) {
    restoredDocs.forEach(doc => tabManager.open(doc));
    activateDocument(tabManager.getActive());
  } else {
    const doc = tabManager.createNew("Untitled");
    activateDocument(doc);
  }

  cursorNav.restore(session.loadCursorHistory());

  /* =====================================================
     ACTIONS
     ===================================================== */
  newTabBtn.addEventListener("click", () => {
    const doc = smartNewTab.handleNewDocument(name =>
      tabManager.createNew(name)
    );
    activateDocument(doc);
    saveSession();
  });

  window.menu.onNewFile(() => {
    const doc = smartNewTab.handleNewDocument(name =>
      tabManager.createNew(name)
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

  window.config.onToggleSmartNewTab(enabled =>
    smartNewTab.setEnabled(enabled)
  );

  /* =====================================================
     CURSOR NAVIGATION (botões simples, sem lógica)
     ===================================================== */
  backBtn.addEventListener("click", () => cursorNav.back());
  forwardBtn.addEventListener("click", () => cursorNav.forward());

  /* =====================================================
     RENDER TABS
     ===================================================== */
  function renderTabs() {
    tabContainer.innerHTML = "";

    tabManager.tabs.forEach(doc => {
      const tabEl = document.createElement("div");
      tabEl.className = "tab";
      if (doc === tabManager.getActive()) {
        tabEl.classList.add("active");
      }

      const btn = document.createElement("button");
      const icon = languageIcons[doc.language] || "📄";
      btn.textContent = `${icon} ${doc.getFileName()}`;
      btn.onclick = () => activateDocument(doc);

      // ✅ Fechar com botão do meio
      btn.addEventListener("mousedown", e => {
        if (e.button === 1) {
          e.preventDefault();
          tabManager.close(doc.id);
          activateDocument(tabManager.getActive());
          saveSession();
        }
      });

      // ✅ Indicador de modificação
      if (doc.isDirty()) {
        const dot = document.createElement("span");
        dot.className = "modified-dot";
        btn.appendChild(dot);
      }

      const close = document.createElement("span");
      close.className = "close";
      close.textContent = "×";
      close.onclick = e => {
        e.stopPropagation();
        tabManager.close(doc.id);
        activateDocument(tabManager.getActive());
        saveSession();
      };

      // ✅ Context menu
      tabEl.addEventListener("contextmenu", e => {
        e.preventDefault();
        showTabContextMenu(e.clientX, e.clientY, doc);
      });

      tabEl.appendChild(btn);
      tabEl.appendChild(close);
      tabContainer.appendChild(tabEl);
    });
  }

  /* =====================================================
     TAB CONTEXT MENU
     ===================================================== */
  function showTabContextMenu(x, y, doc) {
    document.querySelector(".tab-context-menu")?.remove();

    const menu = document.createElement("div");
    menu.className = "tab-context-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.innerHTML = `
      <div class="item">Fechar</div>
      <div class="item">Fechar outras</div>
      <div class="item">Fechar tudo</div>
    `;

    menu.children[0].onclick = () => {
      tabManager.close(doc.id);
      activateDocument(tabManager.getActive());
      saveSession();
      menu.remove();
    };

    menu.children[1].onclick = () => {
      tabManager.tabs
        .filter(t => t.id !== doc.id)
        .forEach(t => tabManager.close(t.id));
      activateDocument(tabManager.getActive());
      saveSession();
      menu.remove();
    };

    menu.children[2].onclick = () => {
      tabManager.tabs.slice().forEach(t => tabManager.close(t.id));
      EditorCore.setDocument(null);
      saveSession();
      menu.remove();
    };

    document.body.appendChild(menu);

    setTimeout(() =>
      document.addEventListener("click", () => menu.remove(), { once: true }),
      0
    );
  }

  /* =====================================================
     APP LIFECYCLE
     ===================================================== */
  window.appLifecycle?.onBeforeQuit(() => saveSession());
};