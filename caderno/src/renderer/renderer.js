require.config({
  paths: {
    vs: "./monaco/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  /*********************************************************
   * ESTADO GLOBAL
   *********************************************************/
  let editor;
  const tabs = [];
  let activeTab = null;
  let wordWrapEnabled = true;
  let draggedTabIndex = null;
  let editorLeft;
  let editorRight = null;
  let isSplitActive = false;
  const closedTabsStack = [];
  const tabsDiv = document.getElementById("tabs");
  const editorDiv = document.getElementById("editor");

  let splitTab = null; // editor direito

  const cursorPosEl = document.getElementById("cursor-pos");
  const languageEl = document.getElementById("language");
  const selectionEl = document.getElementById("selection");

  const navigationHistory = [];
  let historyIndex = -1;
  let isNavigatingHistory = false;

  let cursorTimer = null;

  // ✅ Fonte base usada para cálculo do zoom
  const DEFAULT_FONT_SIZE = 14;

  // ✅ Estado atual do editor
  let editorFontSize = DEFAULT_FONT_SIZE;

  // ✅ Listener NÃO relacionado ao zoom
  document.getElementById("nav-back").addEventListener("click", () => {
    goBackInHistory();
  });


  /*********************************************************
   * UTILIDADES
   *********************************************************/
  document.addEventListener("DOMContentLoaded", () => {
    const contextMenu = document.getElementById("tab-context-menu");
    let contextTab = null;

    if (!contextMenu) {
      console.warn("⚠️ tab-context-menu não encontrado");
      return;
    }

    tabsDiv.addEventListener("contextmenu", (e) => {
      const tabEl = e.target.closest(".tab");
      if (!tabEl) return;

      e.preventDefault();

      const index = Array.from(tabsDiv.children).indexOf(tabEl);
      contextTab = tabs[index];
      if (!contextTab) return;

      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.style.top = `${e.pageY}px`;
      contextMenu.classList.remove("hidden");

      const pin = contextMenu.querySelector('[data-action="pin"]');
      const unpin = contextMenu.querySelector('[data-action="unpin"]');
      const close = contextMenu.querySelector('[data-action="close"]');

      if (pin) pin.style.display = contextTab.pinned ? "none" : "block";
      if (unpin) unpin.style.display = contextTab.pinned ? "block" : "none";
      if (close) close.style.display = contextTab.pinned ? "none" : "block";
    });

    document.addEventListener("click", () => {
      contextMenu.classList.add("hidden");
    });

    contextMenu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action || !contextTab) return;

      if (action === "pin") contextTab.pinned = true;
      if (action === "unpin") contextTab.pinned = false;
      if (action === "close") closeTab(contextTab);

      renderTabs();
      contextMenu.classList.add("hidden");
    });
  });

  /* =========================================================
   RECENT FILES (máx. 20)
========================================================= */
  const RECENT_FILES_KEY = "recentFiles";
  const MAX_RECENT_FILES = 20;

  function getRecentFiles() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_FILES_KEY)) || [];
    } catch {
      return [];
    }
  }

  function setRecentFiles(list) {
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(list));
    // avisa o main para atualizar o menu
    window.api?.updateRecentFiles(list);
  }

  function addRecentFile(filePath) {
    if (!filePath) return;

    let list = getRecentFiles().filter((p) => p !== filePath);
    list.unshift(filePath);
    if (list.length > MAX_RECENT_FILES) list = list.slice(0, MAX_RECENT_FILES);

    setRecentFiles(list);
  }
  function saveTabsOrder() {
    const order = tabs.map((t) => t.path || t.name);
    localStorage.setItem("tabsOrder", JSON.stringify(order));
  }

  function generateTabName() {
    return new Date().toLocaleString();
  }

  const SUPPORTED_LANGUAGES = [
    "plaintext",
    "javascript",
    "typescript",
    "json",
    "html",
    "css",
    "markdown",
    "python",
    "java",
    "csharp",
    "sql",
    "xml",
  ];

  function createDetachedTab(name, content = "", path = null) {
    const language = detectLanguageByFilename(name) || "plaintext";

    const model = monaco.editor.Model(content, language);

    return {
      name: name || generateTabName(),
      path,
      language,
      model,
    };
  }

  function recordNavigation(tab, position) {
    if (isNavigatingHistory) return;

    const last = navigationHistory[historyIndex];
    if (
      last &&
      last.tab === tab &&
      last.position.lineNumber === position.lineNumber &&
      last.position.column === position.column
    ) {
      return; // evita duplicados
    }

    navigationHistory.splice(historyIndex + 1);
    navigationHistory.push({
      tab,
      position: {
        lineNumber: position.lineNumber,
        column: position.column,
      },
    });

    historyIndex = navigationHistory.length - 1;
    updateNavButtons();
  }

  function updateLanguageMenu() {
    if (!activeTab) return;
    window.languageAPI.updateLanguageMenu(activeTab.language);
  }

  function detectLanguageByFilename(name = "") {
    const ext = name.split(".").pop().toLowerCase();
    const map = {
      js: "javascript",
      ts: "typescript",
      json: "json",
      html: "html",
      css: "css",
      md: "markdown",
      py: "python",
      java: "java",
      cs: "csharp",
      sql: "sql",
      xml: "xml",
    };
    return map[ext] || "plaintext";
  }

  function detectLanguageByContent(text = "") {
    const t = text.trim();
    if (/^<!DOCTYPE html>|<\/html>/i.test(t)) return "html";
    if (/^\s*[{[]/.test(t) && /"\s*:/.test(t)) return "json";
    if (/\b(function|const|let|var|import|export)\b/.test(t))
      return "javascript";
    if (/\b(def |import |from )/i.test(t)) return "python";
    if (/\b(public class|static void main)\b/i.test(t)) return "java";
    if (/\bSELECT\b.*\bFROM\b/i.test(t)) return "sql";
    return "plaintext";
  }

  function detectLanguageByFilename(name = "") {
    const ext = name.split(".").pop().toLowerCase();
    const map = {
      js: "javascript",
      ts: "typescript",
      json: "json",
      html: "html",
      css: "css",
      md: "markdown",
      py: "python",
      cs: "csharp",
      java: "java",
      sql: "sql",
      xml: "xml",
    };
    return map[ext] || null;
  }

  function detectLanguageByContent(text = "") {
    const t = text.trim();
    if (/^<!DOCTYPE html>|<\/html>/i.test(t)) return "html";
    if (/^\s*[{[]/.test(t) && /"\s*:/.test(t)) return "json";
    if (/\b(function|const|let|var|=>|import|export)\b/.test(t))
      return "javascript";
    if (/\b(def |import |from )/i.test(t)) return "python";
    if (/\b(public class|static void main)\b/i.test(t)) return "java";
    if (/\bSELECT\b.*\bFROM\b/i.test(t)) return "sql";
    return "plaintext";
  }

  /*********************************************************
   * STATUS BAR
   *********************************************************/
  function updateStatusBar() {
    if (!editor || !editor.getModel()) return;

    const model = editor.getModel();

    /* ===== POSIÇÃO DO CURSOR ===== */
    const pos = editor.getPosition();
    if (pos) {
      cursorPosEl.textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;
    } else {
      cursorPosEl.textContent = "";
    }

    /* ===== LINGUAGEM ===== */
    languageEl.textContent = model.getLanguageId();

    /* ===== SELEÇÃO ===== */
    const sel = editor.getSelection();
    let selectionSize = 0;

    if (sel && !sel.isEmpty()) {
      selectionSize = model.getValueInRange(sel).length;
    }

    selectionEl.textContent = `Sel: ${selectionSize}`;

    /* ===== TAMANHO DO ARQUIVO ===== */
    const text = model.getValue();
    const byteSize = new TextEncoder().encode(text).length;
    const formattedSize = formatBytes(byteSize);

    // Cria ou atualiza o elemento de tamanho
    let sizeEl = document.getElementById("file-size");
    if (!sizeEl) {
      sizeEl = document.createElement("span");
      sizeEl.id = "file-size";
      sizeEl.style.marginLeft = "12px";
      selectionEl.parentElement.appendChild(sizeEl);
    }

    sizeEl.textContent = `Size: ${formattedSize}`;

    /* ===== ZOOM ===== */
    const currentFontSize = editor.getOption(
      monaco.editor.EditorOption.fontSize,
    );

    const zoomPercent = Math.round((currentFontSize / DEFAULT_FONT_SIZE) * 100);

    let zoomEl = document.getElementById("zoom-level");
    if (!zoomEl) {
      zoomEl = document.createElement("span");
      zoomEl.id = "zoom-level";
      zoomEl.style.marginLeft = "12px";
      selectionEl.parentElement.appendChild(zoomEl);
    }

    zoomEl.textContent = `Zoom: ${zoomPercent}%`;
  }

  /*********************************************************
   * EDITOR
   *********************************************************/

  editorLeft = monaco.editor.create(document.getElementById("editor-left"), {
    automaticLayout: true,
    autoIndent: "advanced",
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "on",
    mouseWheelZoom: true,
  });

  // mantém compatibilidade com código existente
  editor = editorLeft;

  const savedFontSize = parseInt(localStorage.getItem("editorFontSize"), 10);

  editor.updateOptions({
    fontSize: isNaN(savedFontSize) ? DEFAULT_FONT_SIZE : savedFontSize,
  });

  require(["./features/zoom.feature"], function () {
    if (window.zoomFeature && editor) {
      window.zoomFeature.init(editor);
    }
  });

  /* =========================================================
   ZOOM DO EDITOR (CTRL + RODA DO MOUSE)
========================================================= */
  /* ===== ZOOM ===== */
  const currentFontSize = editor.getOption(monaco.editor.EditorOption.fontSize);

  const zoomPercent = Math.round((currentFontSize / DEFAULT_FONT_SIZE) * 100);

  let zoomEl = document.getElementById("zoom-level");
  if (!zoomEl) {
    zoomEl = document.createElement("span");
    zoomEl.id = "zoom-level";
    zoomEl.style.marginLeft = "12px";
    selectionEl.parentElement.appendChild(zoomEl);
  }

  zoomEl.textContent = `Zoom: ${zoomPercent}%`;

  // ✅ Inicializa o zoom (CTRL + SCROLL)
  if (window.zoomFeature) {
    window.zoomFeature.init(editor);
  }

  // ✅ LISTENERS UMA VEZ (CORRETO)
  editor.onDidChangeCursorPosition(updateStatusBar);
  editor.onDidChangeCursorSelection(updateStatusBar);

  editor.onDidChangeCursorPosition((e) => {
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => {
      if (activeTab) {
        recordNavigation(activeTab, e.position);
      }
    }, 300); // evita flood ao digitar
  });

  editor.onDidPaste(() => {
    if (!activeTab) return;

    const content = activeTab.model.getValue();
    const detected = detectLanguageByContent(content);

    if (detected !== activeTab.language) {
      activeTab.language = detected;
      monaco.editor.setModelLanguage(activeTab.model, detected);
      updateLanguageMenu();
    }
  });

  /*********************************************************
   * FORMAT DOCUMENT
   *********************************************************/
  function formatDocument() {
    const action = editor.getAction("editor.action.formatDocument");
    if (action) {
      action.run().then(updateStatusBar);
    }
  }

  function enableSplitView() {
    if (isSplitActive) return;

    const container = document.getElementById("editor-container");
    const rightDiv = document.getElementById("editor-right");

    rightDiv.classList.remove("hidden");
    container.classList.add("split");

    // ✅ cria NOVA aba para o split
    splitTab = createDetachedTab("Novo Arquivo");

    editorRight = monaco.editor.create(rightDiv, {
      model: splitTab.model,
      automaticLayout: true,
      wordWrap: wordWrapEnabled ? "on" : "off",
      mouseWheelZoom: true,
    });

    isSplitActive = true;
  }
  editor.onDidChangeConfiguration((e) => {
    if (e.hasChanged(monaco.editor.EditorOption.fontSize)) {
      const fs = editor.getOption(monaco.editor.EditorOption.fontSize);
      localStorage.setItem("editorFontSize", fs);
      updateStatusBar();
    }
  });

  function disableSplitView() {
    if (!isSplitActive) return;

    editorRight.dispose();
    editorRight = null;

    splitTab.model.dispose();
    splitTab = null;

    document.getElementById("editor-right").classList.add("hidden");
    document.getElementById("editor-container").classList.remove("split");

    isSplitActive = false;
  }

  function toggleSplitView() {
    isSplitActive ? disableSplitView() : enableSplitView();
  }

  if (activeTab && editorRight) {
    editorRight.setModel(activeTab.model);
  }

  window.editorAPI?.onFormatDocument(() => {
    formatDocument();
  });

  /*********************************************************
   * ABAS
   *********************************************************/
  function createTab(name, content = "", path = null) {
    const language =
      detectLanguageByFilename(name) ||
      detectLanguageByContent(content) ||
      "plaintext";

    const model = monaco.editor.createModel(content, language);

    const tab = {
      name: name || generateTabName(),
      path,
      language,
      model,
    };

    tabs.push(tab);
    activateTab(tab);
  }

  function activateTab(tab) {
    activeTab = tab;

    monaco.editor.setModelLanguage(tab.model, tab.language);
    editor.setModel(tab.model);

    editorLeft.setModel(tab.model);

    if (isSplitActive && editorRight) {
      editorRight.setModel(tab.model);
    }

    renderTabs();
    updateStatusBar();
    updateLanguageMenu();
    const pos = editor.getPosition();
    if (pos) {
      recordNavigation(tab, pos);
    }
  }

  function goBackInHistory() {
    if (historyIndex <= 0) return;

    isNavigatingHistory = true;
    historyIndex--;

    const entry = navigationHistory[historyIndex];
    activateTab(entry.tab);
    editor.setPosition(entry.position);
    editor.revealPositionInCenter(entry.position);

    isNavigatingHistory = false;
    updateNavButtons();
  }

  function goForwardInHistory() {
    if (historyIndex >= navigationHistory.length - 1) return;

    isNavigatingHistory = true;
    historyIndex++;

    const entry = navigationHistory[historyIndex];
    activateTab(entry.tab);
    editor.setPosition(entry.position);
    editor.revealPositionInCenter(entry.position);

    isNavigatingHistory = false;
    updateNavButtons();
  }

  function updateNavButtons() {
    document.getElementById("nav-back").disabled = historyIndex <= 0;
    document.getElementById("nav-forward").disabled =
      historyIndex >= navigationHistory.length - 1;
  }

  function closeTab(tab) {
    const i = tabs.indexOf(tab);
    if (i === -1) return;

    tab.model.dispose();
    tabs.splice(i, 1);

    saveTabsOrder(); // ✅ mantém persistência

    tabs.length ? activateTab(tabs[Math.max(0, i - 1)]) : createTab();

    closedTabsStack.push({
      name: tab.name,
      path: tab.path,
      language: tab.language,
      content: tab.model.getValue(),
    });

    if (closedTabsStack.length > 20) {
      closedTabsStack.shift();
    }
  }
  function restoreClosedTab() {
    const last = closedTabsStack.pop();
    if (!last) return;

    createTab(last.name, last.content, last.path);
  }

  function applySavedTabsOrder() {
    const saved = localStorage.getItem("tabsOrder");
    if (!saved) return;

    const order = JSON.parse(saved);

    tabs.sort((a, b) => {
      const aKey = a.path || a.name;
      const bKey = b.path || b.name;

      return order.indexOf(aKey) - order.indexOf(bKey);
    });
  }

  function renderTabs() {
    tabsDiv.innerHTML = "";

    tabs.forEach((tab, index) => {
      const el = document.createElement("div");
      el.className = "tab" + (tab === activeTab ? " active" : "");
      el.textContent = tab.name;
      el.draggable = true; // ✅ TORNA A ABA ARRASTÁVEL

      /* ===============================
       DRAG START
    =============================== */
      el.addEventListener("dragstart", (e) => {
        draggedTabIndex = index;
        el.classList.add("dragging");
        e.dataTransfer.setData("text/plain", "");
      });

      /* ===============================
       DRAG OVER
    =============================== */
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        el.classList.add("drag-over");
      });

      /* ===============================
       DRAG LEAVE
    =============================== */
      el.addEventListener("dragleave", () => {
        el.classList.remove("drag-over");
      });

      /* ===============================
       DROP  
    =============================== */
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("drag-over");

        const targetIndex = index;

        if (draggedTabIndex === null || draggedTabIndex === targetIndex) {
          return;
        }

        const [movedTab] = tabs.splice(draggedTabIndex, 1);
        tabs.splice(targetIndex, 0, movedTab);

        draggedTabIndex = null;

        saveTabsOrder(); // ✅ AQUI
        renderTabs();
      });

      /* ===============================
       DRAG END
    =============================== */
      el.addEventListener("dragend", () => {
        draggedTabIndex = null;
        el.classList.remove("dragging");
        el.classList.remove("drag-over");
      });

      /* ===============================
       BOTÃO FECHAR
    =============================== */
      const closeBtn = document.createElement("span");
      closeBtn.className = "tab-close";
      closeBtn.textContent = "×";
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeTab(tab);
      };

      el.appendChild(closeBtn);

      /**
       * Restaurar ABa
       */
      window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
          e.preventDefault();
          restoreClosedTab();
        }
      });

      /* ===============================
       ATIVAR ABA
    =============================== */
      el.onclick = () => activateTab(tab);

      tabsDiv.appendChild(el);
    });
  }

  window.addEventListener("keydown", (e) => {
    // Ctrl + \  (padrão VS Code)
    if (e.ctrlKey && e.key === "\\") {
      e.preventDefault();
      toggleSplitView();
    }
  });
  /* =========================================================
   FECHAR ABA COM BOTÃO DO MEIO DO MOUSE
========================================================= */
  tabsDiv.addEventListener("mousedown", (e) => {
    // botão do meio do mouse
    if (e.button !== 1) return;

    const tabEl = e.target.closest(".tab");
    if (!tabEl) return;

    e.preventDefault();
    e.stopPropagation();

    // Descobre o índice da aba clicada
    const index = Array.from(tabsDiv.children).indexOf(tabEl);
    if (index < 0) return;

    const tab = tabs[index];
    if (tab) {
      closeTab(tab);
    }
  });
  /*********************************************************
   * NAVEGAÇÃO ENTRE ABAS
   *********************************************************/
  function goToNextTab() {
    if (!activeTab || tabs.length < 2) return;

    const index = tabs.indexOf(activeTab);
    const nextIndex = (index + 1) % tabs.length;

    activateTab(tabs[nextIndex]);
  }

  function goToPreviousTab() {
    if (!activeTab || tabs.length < 2) return;

    const index = tabs.indexOf(activeTab);
    const prevIndex = (index - 1 + tabs.length) % tabs.length;

    activateTab(tabs[prevIndex]);
  }

  /*********************************************************
   * SALVAR ARQUIVO
   *********************************************************/
  async function saveActiveTab() {
    if (!activeTab) return;

    const savedPath = await window.api.saveFile({
      path: activeTab.path || null,
      content: activeTab.model.getValue(),
    });

    if (savedPath) {
      activeTab.path = savedPath;
      activeTab.name = savedPath.split(/[\\/]/).pop();
      renderTabs();
    }
    addFile(activeTab.path);
    addRecentFile(activeTab.path);
  }

  /*********************************************************
   * WORD WRAP
   *********************************************************/
  function toggleWordWrap() {
    wordWrapEnabled = !wordWrapEnabled;

    editor.updateOptions({
      wordWrap: wordWrapEnabled ? "on" : "off",
      wrappingIndent: "same",
    });

    window.viewAPI.updateWordWrapState(wordWrapEnabled);
  }

  window.viewAPI.onToggleWordWrap(() => {
    toggleWordWrap();
  });

  /*********************************************************
   * SESSÃO
   *********************************************************/
  function collectSession() {
    return {
      activeIndex: tabs.indexOf(activeTab),
      wordWrap: wordWrapEnabled,
      tabs: tabs.map((t) => ({
        name: t.name,
        path: t.path,
        language: t.language,
        content: t.model.getValue(),
      })),
    };
  }

  async function restoreSession() {
    const session = await window.sessionAPI.load();

    // ❌ Nada para restaurar
    if (!session || !Array.isArray(session.tabs) || session.tabs.length === 0) {
      return false;
    }

    /* ===============================
     RESTAURA OPÇÕES GLOBAIS
  =============================== */
    wordWrapEnabled = session.wordWrap ?? true;

    editor.updateOptions({
      wordWrap: wordWrapEnabled ? "on" : "off",
    });

    /* ===============================
     LIMPA ESTADO ATUAL
  =============================== */
    tabs.length = 0;
    activeTab = null;

    /* ===============================
     RECRIA CADA ABA COM A LINGUAGEM SALVA
  =============================== */
    session.tabs.forEach((t) => {
      const language = t.language || "plaintext";

      const model = monaco.editor.createModel(t.content || "", language);

      tabs.push({
        name: t.name || generateTabName(),
        path: t.path || null,
        language: language, // ✅ linguagem restaurada
        model,
      });
    });

    /* ===============================
     ATIVA A ABA CORRETA
  =============================== */
    const index =
      typeof session.activeIndex === "number" && tabs[session.activeIndex]
        ? session.activeIndex
        : 0;

    activateTab(tabs[index]); // ✅ aplica linguagem + menu

    // após recriar todas as abas
    applySavedTabsOrder();

    // agora ativa a aba correta
    activateTab(tabs[session.activeIndex] || tabs[0]);

    return true;
  }

  window.sessionBridge.onRequestSave(() => {
    window.sessionBridge.saveToMain(collectSession());
  });

  /*********************************************************
   * MENUS
   *********************************************************/
  window.api.onNewTab(() => createTab());
  window.api.onCloseTab(() => activeTab && closeTab(activeTab));

  window.api.onOpen(async () => {
    const r = await window.api.openFile();
    if (r) createTab(r.path.split(/[\\/]/).pop(), r.content, r.path);
    addRecentFile(r.path);
  });

  window.api.onSave(saveActiveTab);

  window.api?.onOpenRecentFile(async (filePath) => {
    const result = await window.api.openFileByPath(filePath);
    if (!result) return;

    createTab(result.path.split(/[\\/]/).pop(), result.content, result.path);

    addRecentFile(result.path); // sobe para o topo da lista
  });

  /*********************************************************
   * CTRL + K  →  CTRL + D (CORRIGIDO, SEM TRAVAR)
   *********************************************************/
  let awaitingCtrlKD = false;

  window.addEventListener(
    "keydown",
    (e) => {
      if (
        e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        awaitingCtrlKD = true;
        setTimeout(() => (awaitingCtrlKD = false), 1200);
        return;
      }

      if (awaitingCtrlKD && e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        awaitingCtrlKD = false;
        formatDocument();
        return;
      }

      if (awaitingCtrlKD) awaitingCtrlKD = false;
    },
    true,
  );

  /*********************************************************
   * ATALHOS: CTRL + TAB / CTRL + SHIFT + TAB
   *********************************************************/
  window.addEventListener(
    "keydown",
    (e) => {
      // Ctrl + Tab → próxima aba
      if (e.ctrlKey && !e.shiftKey && e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        goToNextTab();
        return;
      }

      // Ctrl + Shift + Tab → aba anterior
      if (e.ctrlKey && e.shiftKey && e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        goToPreviousTab();
        return;
      }
    },
    true, // ✅ IMPORTANTE: capture phase (evita conflito com Monaco)
  );

  document.getElementById("nav-back").onclick = goBackInHistory;
  document.getElementById("nav-forward").onclick = goForwardInHistory;

  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      goBackInHistory();
    }

    if (e.altKey && e.key === "ArrowRight") {
      e.preventDefault();
      goForwardInHistory();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "j") {
      e.preventDefault();
      toggleSplitView();
    }
  });
  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
  function updateNavButtons() {
    document.getElementById("nav-back").disabled = historyIndex <= 0;
    document.getElementById("nav-forward").disabled =
      historyIndex >= navigationHistory.length - 1;
  }

  /*********************************************************
   * INIT
   *********************************************************/
  restoreSession().then((restored) => {
    if (!restored) createTab();
  });
  //
  window.languageAPI.onSetLanguage((lang) => {
    if (!activeTab) return;

    activeTab.language = lang;
    monaco.editor.setModelLanguage(activeTab.model, lang);

    updateStatusBar();
    updateLanguageMenu();
  });

  const navSplitBtn = document.getElementById("nav-split");

  if (navSplitBtn) {
    navSplitBtn.addEventListener("click", () => {
      toggleSplitView();
    });
  }

  /* =========================================================
   INICIALIZA RECENT FILES NO MENU
========================================================= */
  (function initRecentFilesMenu() {
    try {
      const recent = JSON.parse(localStorage.getItem("recentFiles")) || [];
      if (recent.length && window.api?.updateRecentFiles) {
        window.api.updateRecentFiles(recent);
      }
    } catch (err) {
      console.error("Erro ao inicializar Recent Files:", err);
    }
  })();

  /**/
});
