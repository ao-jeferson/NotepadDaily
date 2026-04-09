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

  const tabsDiv = document.getElementById("tabs");
  const editorDiv = document.getElementById("editor");

  const cursorPosEl = document.getElementById("cursor-pos");
  const languageEl = document.getElementById("language");
  const selectionEl = document.getElementById("selection");

  /*********************************************************
   * UTILIDADES
   *********************************************************/
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
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const pos = editor.getPosition();
    if (pos) {
      cursorPosEl.textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;
    } else {
      cursorPosEl.textContent = "";
    }

    languageEl.textContent = model.getLanguageId();

    const sel = editor.getSelection();
    if (sel && !sel.isEmpty()) {
      selectionEl.textContent = `Sel: ${model.getValueInRange(sel).length}`;
    } else {
      selectionEl.textContent = "Sel: 0";
    }
  }

  /*********************************************************
   * EDITOR
   *********************************************************/
  editor = monaco.editor.create(editorDiv, {
    automaticLayout: true,
    autoIndent: "advanced",
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "on",
  });

  // ✅ LISTENERS UMA VEZ (CORRETO)
  editor.onDidChangeCursorPosition(updateStatusBar);
  editor.onDidChangeCursorSelection(updateStatusBar);

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
    renderTabs();
    updateStatusBar();
  }

  function closeTab(tab) {
    const i = tabs.indexOf(tab);
    if (i === -1) return;

    tab.model.dispose();
    tabs.splice(i, 1);

    if (tabs.length) activateTab(tabs[Math.max(0, i - 1)]);
    else createTab();
  }

  function renderTabs() {
    tabsDiv.innerHTML = "";

    tabs.forEach((tab) => {
      const el = document.createElement("div");
      el.className = "tab" + (tab === activeTab ? " active" : "");
      el.textContent = tab.name;

      const closeBtn = document.createElement("span");
      closeBtn.className = "tab-close";
      closeBtn.textContent = "×";
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeTab(tab);
      };

      el.appendChild(closeBtn);
      el.onclick = () => activateTab(tab);

      el.addEventListener("mousedown", (e) => {
        if (e.button === 1) {
          e.preventDefault();
          closeTab(tab);
        }
      });

      tabsDiv.appendChild(el);
    });
  }

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
    const s = await window.sessionAPI.load();
    if (!s || !Array.isArray(s.tabs)) return false;

    wordWrapEnabled = s.wordWrap ?? true;
    editor.updateOptions({
      wordWrap: wordWrapEnabled ? "on" : "off",
      wrappingIndent: "same",
    });

    tabs.length = 0;
    activeTab = null;

    s.tabs.forEach((t) => {
      createTab(t.name, t.content, t.path);
    });

    if (tabs[s.activeIndex]) activateTab(tabs[s.activeIndex]);
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
  });

  window.api.onSave(saveActiveTab);

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

  /*********************************************************
   * INIT
   *********************************************************/
  restoreSession().then((restored) => {
    if (!restored) createTab();
  });

  window.languageAPI.onSetLanguage((lang) => {
    if (!activeTab) return;

    activeTab.language = lang;
    monaco.editor.setModelLanguage(activeTab.model, lang);

    updateStatusBar();
    updateLanguageMenu();
  });
});
