require.config({ paths: { vs: "./monaco/vs" } });

require(["vs/editor/editor.main"], function () {

  const editor = monaco.editor.create(
    document.getElementById("editor"),
    { automaticLayout: true }
  );

  let diffEditor = null;

  function ensureEditorMode() {
    document.getElementById("editor").style.display = "block";
    document.getElementById("diff-editor").style.display = "none";
    if (diffEditor) diffEditor.setModel(null);
  }

  function getDiffEditor() {
    if (diffEditor) return diffEditor;
    diffEditor = monaco.editor.createDiffEditor(
      document.getElementById("diff-editor"),
      { automaticLayout: true }
    );
    return diffEditor;
  }

  /* ================= TABS ================== */

  const tabs = [];
  let activeTab = null;
  const tabsDiv = document.getElementById("tabs");

  
function createTab(name, content) {
  const model = monaco.editor.createModel(content || "");

  const tab = {
    name: name || generateTabName(),
    model
  };

  tabs.push(tab);
  activateTab(tab);
}


  function activateTab(tab) {
    ensureEditorMode();
    activeTab = tab;
    editor.setModel(tab.model);
    renderTabs();
    updateStatus();
  }

  function closeTab(tab) {
    if (!tab) return;
    ensureEditorMode();
    const i = tabs.indexOf(tab);
    tab.model.dispose();
    tabs.splice(i, 1);
    if (!tabs.length) createTab();
    else activateTab(tabs[i] || tabs[i - 1]);
  }

  function renderTabs() {
    tabsDiv.innerHTML = "";
    tabs.forEach(tab => {
      const el = document.createElement("div");
      el.className = "tab" + (tab === activeTab ? " active" : "");
      el.textContent = tab.name;

      const x = document.createElement("span");
      x.textContent = "×";
      x.className = "close";
      x.onclick = e => { e.stopPropagation(); closeTab(tab); };

      el.appendChild(x);
      el.onclick = () => activateTab(tab);
      tabsDiv.appendChild(el);
    });
  }

  /* ================= DIFF ================== */

  function diffWithPreviousTab() {
    if (tabs.length < 2) return;
    const i = tabs.indexOf(activeTab);
    if (i <= 0) return;

    const diff = getDiffEditor();
    diff.setModel({
      original: monaco.editor.createModel(tabs[i - 1].model.getValue()),
      modified: monaco.editor.createModel(activeTab.model.getValue())
    });

    document.getElementById("editor").style.display = "none";
    document.getElementById("diff-editor").style.display = "block";
  }

  /* ================= STATUS ================== */

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
      sel && !sel.isEmpty() ? `Sel: ${model.getValueInRange(sel).length}` : "Sel: 0";
  }

  editor.onDidChangeCursorPosition(updateStatus);
  editor.onDidChangeCursorSelection(updateStatus);

  /* ================= MENU ================== */

  window.api.onNewTab(() => createTab());
  window.api.onCloseTab(() => closeTab(activeTab));
  window.api.onOpen(async () => {
    const r = await window.api.openFile();
    if (r) createTab(r.path.split(/[\\/]/).pop(), r.content);
  });

  window.diffAPI.onDiffPrevious(() => diffWithPreviousTab());
  window.diffAPI.onDiffExit(() => ensureEditorMode());

  /* ================= SESSION ================== */

  function collectSession() {
    return {
      index: tabs.indexOf(activeTab),
      tabs: tabs.map(t => ({ name: t.name, content: t.model.getValue() }))
    };
  }

function generateTabName() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
}

  async function restoreSession() {
    const s = await window.sessionAPI.load();
    if (!s) return false;
    s.tabs.forEach(t => createTab(t.name, t.content));
    if (tabs[s.index]) activateTab(tabs[s.index]);
    return true;
  }

  window.addEventListener("beforeunload", () =>
    window.sessionAPI.save(collectSession())
  );

  restoreSession().then(r => { if (!r) createTab(); });
});