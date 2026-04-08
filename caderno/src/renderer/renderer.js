require.config({ paths: { vs: "./monaco/vs" } });

require(["vs/editor/editor.main"], function () {
  const editor = monaco.editor.create(document.getElementById("editor"), {
    theme: "vs-white",
    automaticLayout: true,
  });

  const cursorPosEl = document.getElementById("cursor-pos");
  const languageEl = document.getElementById("language");
  const selectionEl = document.getElementById("selection");

  // =========================
  // STATUS BAR
  // =========================
  function updateCursorPosition() {
    const pos = editor.getPosition();
    if (!pos) return;
    cursorPosEl.textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;
  }

  function updateSelectionCount() {
    const sel = editor.getSelection();
    if (!sel || sel.isEmpty()) {
      selectionEl.textContent = "Sel: 0";
      return;
    }

    const model = editor.getModel();
    const text = model.getValueInRange(sel);

    selectionEl.textContent = `Sel: ${text.length}`;
  }

  function updateLanguage() {
    const model = editor.getModel();
    if (!model) return;

    const lang = model.getLanguageId();
    languageEl.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
  }

  // ligar eventos corretos
  editor.onDidChangeCursorPosition(updateCursorPosition);
  editor.onDidChangeCursorSelection(updateSelectionCount);
  editor.onDidChangeModelContent(() => {
    updateFileSize();
  });

  // =========================
  // GERENCIADOR DE ABAS
  // =========================
  const tabs = [];
  let activeTab = null;
  const tabsDiv = document.getElementById("tabs");

  const fileSizeEl = document.getElementById("filesize");
  const encodingEl = document.getElementById("encoding");

  function nowName() {
    return new Date().toLocaleString();
  }

  function updateFileSize() {
    const model = editor.getModel();
    if (!model) {
      fileSizeEl.textContent = "0 B";
      return;
    }
    const text = model.getValue();
    // UTF-8 aproximado: 1 char ASCII ≈ 1 byte
    const bytes = new TextEncoder().encode(text).length;
    fileSizeEl.textContent = formatBytes(bytes);
  }

  function updateEncoding() {
    encodingEl.textContent = "UTF-8";
  }

  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function renderTabs() {
    tabsDiv.innerHTML = "";

    tabs.forEach((tab) => {
      const el = document.createElement("div");
      el.className = "tab" + (tab === activeTab ? " active" : "");
      el.textContent = tab.name;

      const close = document.createElement("span");
      close.className = "close";
      close.textContent = "×";
      close.onclick = (e) => {
        e.stopPropagation();
        activeTab = tab;
        closeActiveTab();
      };

      el.appendChild(close);
      el.onclick = () => activateTab(tab);
      tabsDiv.appendChild(el);
    });
  }

  function activateTab(tab) {
    activeTab = tab;
    editor.setModel(tab.model);
    renderTabs();

    // ✅ atualizar status bar ao trocar de aba
    updateCursorPosition();
    updateSelectionCount();
    updateLanguage();
    updateFileSize();
    updateEncoding();
  }

  function createTab(name, content, path) {
    const model = monaco.editor.createModel(content || "");
    const tab = {
      name: name || nowName(),
      model,
      path: path || null,
    };
    tabs.push(tab);
    activateTab(tab);
    updateFileSize();
    updateEncoding();
  }

  function closeActiveTab() {
    if (!activeTab) return;

    const index = tabs.indexOf(activeTab);
    if (index === -1) return;

    activeTab.model.dispose();
    tabs.splice(index, 1);

    if (tabs.length === 0) {
      activeTab = null;
      editor.setModel(null);
    } else {
      const next = tabs[index] || tabs[index - 1];
      activateTab(next);
    }

    renderTabs();
  }

  function nextTab() {
    if (!activeTab || tabs.length <= 1) return;
    const index = tabs.indexOf(activeTab);
    activateTab(tabs[(index + 1) % tabs.length]);
  }

  function previousTab() {
    if (!activeTab || tabs.length <= 1) return;
    const index = tabs.indexOf(activeTab);
    activateTab(tabs[(index - 1 + tabs.length) % tabs.length]);
  }

  // =========================
  // MENU / IPC
  // =========================
  window.api.onNewTab(() => createTab());
  window.api.onCloseTab(() => closeActiveTab());

  window.api.onOpen(async () => {
    const r = await window.api.openFile();
    if (!r) return;
    createTab(r.path.split(/[\\/]/).pop(), r.content, r.path);
  });

  window.api.onSave(async () => {
    if (!activeTab) return;
    const path = await window.api.saveFile({
      path: activeTab.path,
      content: activeTab.model.getValue(),
    });
    if (path) {
      activeTab.path = path;
      activeTab.name = path.split(/[\\/]/).pop();
      renderTabs();
      updateFileSize();
    }
  });

  // =========================
  // ATALHOS
  // =========================
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "t") {
      e.preventDefault();
      createTab();
    }
    if (e.ctrlKey && e.key === "o") {
      e.preventDefault();
      window.api
        .openFile()
        .then(
          (r) => r && createTab(r.path.split(/[\\/]/).pop(), r.content, r.path),
        );
    }
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      activeTab &&
        window.api.saveFile({
          path: activeTab.path,
          content: activeTab.model.getValue(),
        });
    }
    if (e.ctrlKey && !e.shiftKey && e.key === "Tab") {
      e.preventDefault();
      nextTab();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "Tab") {
      e.preventDefault();
      previousTab();
    }
  });

  // =========================
  // ABA INICIAL
  // =========================
  createTab(null, "// Nova aba\n");
  updateCursorPosition();
  updateSelectionCount();
  updateLanguage();
  updateFileSize();
  updateEncoding();
});
