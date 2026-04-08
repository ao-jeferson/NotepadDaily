require.config({ paths: { vs: "./monaco/vs" } });

require(["vs/editor/editor.main"], function () {

  const editor = monaco.editor.create(
    document.getElementById("editor"),
    { theme: "vs-white", automaticLayout: true }
  );

  /* =========================
     STATUS BAR
  ========================= */

  const cursorPosEl = document.getElementById("cursor-pos");
  const languageEl = document.getElementById("language");
  const selectionEl = document.getElementById("selection");

  function updateStatus() {
    const pos = editor.getPosition();
    if (pos) cursorPosEl.textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;

    const model = editor.getModel();
    if (model) languageEl.textContent = model.getLanguageId();

    const sel = editor.getSelection();
    selectionEl.textContent =
      sel && !sel.isEmpty()
        ? `Sel: ${model.getValueInRange(sel).length}`
        : "Sel: 0";
  }

  editor.onDidChangeCursorPosition(updateStatus);
  editor.onDidChangeCursorSelection(updateStatus);

  /* =========================
     ABAS
  ========================= */

  const tabs = [];
  let activeTab = null;
  const tabsDiv = document.getElementById("tabs");

  function nowName() {
    return new Date().toLocaleString();
  }

  function renderTabs() {
    tabsDiv.innerHTML = "";
    tabs.forEach(tab => {
      const el = document.createElement("div");
      el.className = "tab" + (tab === activeTab ? " active" : "");
      el.textContent = tab.name;
      el.onclick = () => activateTab(tab);
      tabsDiv.appendChild(el);
    });
  }

  function activateTab(tab) {
    activeTab = tab;
    editor.setModel(tab.model);
    renderTabs();
    updateStatus();
  }

  function createTab(name, content) {
    const model = monaco.editor.createModel(content || "");
    const tab = { name: name || nowName(), model };
    tabs.push(tab);
    activateTab(tab);
  }

  function collectSession() {
    return {
      activeTabIndex: tabs.indexOf(activeTab),
      tabs: tabs.map(t => ({
        name: t.name,
        content: t.model.getValue()
      }))
    };
  }

  async function restoreSession() {
    const session = await window.sessionAPI.load();
    if (!session) return false;

    session.tabs.forEach(t => createTab(t.name, t.content));
    if (tabs[session.activeTabIndex]) {
      activateTab(tabs[session.activeTabIndex]);
    }
    return true;
  }

  window.addEventListener("beforeunload", () => {
    window.sessionAPI.save(collectSession());
  });

  /* =========================
     MENU
  ========================= */

  window.api.onNewTab(() => createTab());
  window.api.onOpen(async () => {
    const r = await window.api.openFile();
    if (r) createTab(r.path.split(/[\\/]/).pop(), r.content);
  });

  window.api.onSave(async () => {
    if (!activeTab) return;
    const path = await window.api.saveFile({
      path: null,
      content: activeTab.model.getValue()
    });
    if (path) activeTab.name = path.split(/[\\/]/).pop();
    renderTabs();
  });

  /* =========================
     INIT
  ========================= */

  restoreSession().then(restored => {
    if (!restored) createTab(null, "// Nova aba\n");
  });
});