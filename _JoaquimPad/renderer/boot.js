import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";
import TabManager from "../core/editor/TabManager.js";
import SessionManager from "../core/session/SessionManager.js";
import { SmartNewTabFeature } from "../features/smart-new-tab/SmartNewTabFeature.js";
import { CursorNavigationFeature } from "../features/cursor-navigation/CursorNavigationFeature.js";

window.createEditor = () => {
  /* =====================================================
     DOM
     ===================================================== */
  const editorContainer = document.getElementById("editor");
  const tabContainer = document.getElementById("tabs");
  const newTabBtn = document.getElementById("newTabBtn");
  const backBtn = document.getElementById("cursorBack");
  const forwardBtn = document.getElementById("cursorForward");

  let sortable = null;

  const languageIcons = {
    javascript: "js",
    typescript: "ts",
    python: "python",
    csharp: "csharp",
    java: "java",
    sql: "sql",
    json: "json",
    yaml: "yaml",
    html: "html",
    css: "css",
    c: "c",
    cpp: "cpp",
    go: "go",
    rust: "rust",
    php: "php",
    shell: "shell",
    markdown: "markdown",
    plaintext: null,
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

  cursorNav.onStateChange(({ canGoBack, canGoForward }) => {
    backBtn.disabled = !canGoBack;
    forwardBtn.disabled = !canGoForward;
  });

  /* =====================================================
     CONFIGURAÇÕES
     ===================================================== */
  window.config?.onToggleSmartNewTab((enabled) => {
    smartNewTab.setEnabled(enabled);
  });

  /* =====================================================
     SESSION
     ===================================================== */

  const saveSession = () => {
    session.saveSnapshot({
      ...tabManager.getSnapshot(),
      cursorHistory: cursorNav.serialize(),
    });
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

  const snapshot = session.loadSnapshot();

  if (snapshot) {
    tabManager.restoreSnapshot(snapshot);

    if (snapshot.cursorHistory) {
      cursorNav.restore(snapshot.cursorHistory);
    }

    const active = tabManager.getActive();
    if (active) {
      activateDocument(active);
    }

    // ✅ GARANTE que a UI reflita a sessão imediatamente
    renderTabs();
  } else {
    const doc = tabManager.createNew("Untitled");
    activateDocument(doc);
    renderTabs();
  }

  /* =====================================================
     ACTIONS
     ===================================================== */
  newTabBtn.onclick = () => {
    const doc = smartNewTab.handleNewDocument((name) =>
      tabManager.createNew(name),
    );
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

      // força atualização do highlight do Monaco
      EditorCore.refreshModelLanguage?.();

      renderTabs();
      saveSession();
    });
  }

  /* =====================================================
     CURSOR NAVIGATION
     ===================================================== */
  backBtn.onclick = () => cursorNav.back();
  forwardBtn.onclick = () => cursorNav.forward();

  /* =====================================================
     SORTABLE (somente abas não pinadas)
     ===================================================== */
  function setupSortable() {
    if (!window.Sortable) return;
    if (sortable) sortable.destroy();

    sortable = Sortable.create(tabContainer, {
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      filter: ".pinned",
      preventOnFilter: false,

      onEnd: ({ oldIndex, newIndex }) => {
        if (oldIndex === newIndex) return;

        const pinned = tabManager.tabs.filter((t) => t.pinned);
        const normal = tabManager.tabs.filter((t) => !t.pinned);

        const moved = normal.splice(oldIndex, 1)[0];
        normal.splice(newIndex, 0, moved);

        tabManager.tabs = [...pinned, ...normal];
        renderTabs();
        saveSession();
      },
    });
  }

  /* =====================================================
     RENDER TABS (PINNED À ESQUERDA)
     ===================================================== */
  function renderTabs() {
    tabContainer.innerHTML = "";

    // 1. Organiza abas: pinadas à esquerda
    const pinnedTabs = tabManager.tabs.filter((t) => t.pinned);
    const normalTabs = tabManager.tabs.filter((t) => !t.pinned);
    const orderedTabs = [...pinnedTabs, ...normalTabs];

    orderedTabs.forEach((doc) => {
      const tab = document.createElement("div");
      tab.className = "tab";

      if (doc === tabManager.getActive()) {
        tab.classList.add("active");
      }

      if (doc.pinned) {
        tab.classList.add("pinned");
      }

      // 2. Botão principal da aba
      const btn = document.createElement("button");
      btn.type = "button";

      // 3. Ícone da linguagem
      const iconKey = languageIcons[doc.language];
      if (iconKey) {
        const icon = document.createElement("img");
        icon.src = `../assets/icons/${iconKey}.png`;
        icon.className = "tab-icon";
        icon.alt = doc.language;
        btn.appendChild(icon);
      }

      // 4. Título da aba
      const title = document.createElement("span");
      title.className = "tab-title";
      title.textContent = doc.getFileName();
      btn.appendChild(title);

      // 5. Indicador de modificação (*)
      if (doc.isDirty()) {
        const dirtyDot = document.createElement("span");
        dirtyDot.className = "modified-dot";
        btn.appendChild(dirtyDot);
      }

      // 6. Ativar documento ao clicar
      btn.onclick = () => {
        activateDocument(doc);
      };

      // 7. Clique do meio fecha aba (se não estiver pinada)
      btn.onmousedown = (e) => {
        if (e.button === 1 && !doc.pinned) {
          e.preventDefault();
          tabManager.close(doc.id);
          cursorNav.onTabClosed(doc.id);
          activateDocument(tabManager.getActive());
          saveSession();
        }
      };

      tab.appendChild(btn);

      // 8. Botão de fechar (não aparece se estiver pinada)
      if (!doc.pinned) {
        const close = document.createElement("span");
        close.className = "close";
        close.textContent = "×";

        close.onclick = (e) => {
          e.stopPropagation();
          tabManager.close(doc.id);
          cursorNav.onTabClosed(doc.id);
          activateDocument(tabManager.getActive());
          saveSession();
        };

        tab.appendChild(close);
      }

      // 9. Menu de contexto (pin, fechar, etc.)
      tab.oncontextmenu = (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, doc);
      };

      tabContainer.appendChild(tab);
    });

    // 10. Drag & drop (SortableJS)
    setupSortable();
  }

  /* =====================================================
     CONTEXT MENU
     ===================================================== */
  function showContextMenu(x, y, doc) {
    document.querySelector(".tab-context-menu")?.remove();

    const menu = document.createElement("div");
    menu.className = "tab-context-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.innerHTML = `
      <div class="item">${doc.pinned ? "Unpin Tab" : "Pin Tab"}</div>
      ${doc.pinned ? "" : "<div class='item'>Fechar</div>"}
      <div class="item">Fechar outras</div>
    `;

    let i = 0;

    // Pin / Unpin
    menu.children[i++].onclick = () => {
      doc.pinned = !doc.pinned;

      tabManager.tabs = [
        ...tabManager.tabs.filter((t) => t.pinned),
        ...tabManager.tabs.filter((t) => !t.pinned),
      ];

      renderTabs();
      saveSession();
      menu.remove();
    };

    // Fechar
    if (!doc.pinned) {
      menu.children[i++].onclick = () => {
        tabManager.close(doc.id);
        cursorNav.onTabClosed(doc.id);
        activateDocument(tabManager.getActive());
        saveSession();
        menu.remove();
      };
    }

    // Fechar outras (preserva pinadas)
    menu.children[i].onclick = () => {
      tabManager.tabs
        .filter((t) => t.id !== doc.id && !t.pinned)
        .forEach((t) => tabManager.close(t.id));

      activateDocument(tabManager.getActive());
      saveSession();
      menu.remove();
    };

    document.body.appendChild(menu);
    setTimeout(
      () =>
        document.addEventListener("click", () => menu.remove(), { once: true }),
      0,
    );
  }

  /* =====================================================
     APP LIFECYCLE
     ===================================================== */
  window.appLifecycle?.onBeforeQuit(() => saveSession());

  window.menu?.onSetLanguage?.((language) => {
    const doc = tabManager.getActive();
    if (!doc) return;

    doc.setLanguage(language, true);
    EditorCore.setLanguage(language);

    renderTabs();
    saveSession();
  });
};
