require.config({
  paths: {
    vs: "./monaco/vs",
    editor: "./editor"
  }
});

require([
  "vs/editor/editor.main",
  "editor/state",
  "editor/editor",
  "editor/tabs",
  "editor/session",
  "editor/wordWrap"
], function (_m, state, editorApi, tabsApi, sessionApi, wordWrapApi) {

  editorApi.createEditor(document.getElementById("editor"));

  sessionApi.restoreSession().then(restored => {
    if (!restored) {
      tabsApi.createTab();
    }
    wordWrapApi.applyWordWrap();
  });

  async function saveActiveTab() {
    if (!state.activeTab) return;

    const savedPath = await window.api.saveFile({
      path: state.activeTab.path || null,
      content: state.activeTab.model.getValue()
    });

    if (savedPath) {
      state.activeTab.name = savedPath.split(/[\\/]/).pop();
      state.activeTab.path = savedPath;
      tabsApi.activateTab(state.activeTab);
    }
  }

  window.api.onNewTab(() => tabsApi.createTab());
  window.api.onCloseTab(() => state.activeTab && tabsApi.closeTab(state.activeTab));

  window.api.onOpen(async () => {
    const r = await window.api.openFile();
    if (r) tabsApi.createTab(r.path.split(/[\\/]/).pop(), r.content);
  });

  window.api.onSave(() => saveActiveTab());

  window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveActiveTab();
    }
  });

  window.viewAPI?.onToggleWordWrap(() => {
    wordWrapApi.toggleWordWrap();
  });

  window.sessionBridge.onRequestSave(() => {
    window.sessionBridge.saveToMain(sessionApi.collectSession());
  });
});