require.config({
  paths: {
    vs: "./monaco/vs",
    editor: "./editor",
  },
});

require(
  [
    "vs/editor/editor.main",
    "editor/state",
    "editor/editor",
    "editor/tabs",
    "editor/session",
  ],
  function (_monaco, state, editorApi, tabsApi, sessionApi) {

    editorApi.createEditor(document.getElementById("editor"));

    sessionApi.restoreSession().then(restored => {
      if (!restored) tabsApi.createTab();
    });

    window.api.onNewTab(() => tabsApi.createTab());
    window.api.onCloseTab(() => {
      if (state.activeTab) tabsApi.closeTab(state.activeTab);
    });

    window.api.onOpen(async () => {
      const r = await window.api.openFile();
      if (r) tabsApi.createTab(r.path.split(/[\\/]/).pop(), r.content);
    });

    window.api.onSave(() => {
      if (!state.activeTab) return;
      window.api.saveFile({
        path: null,
        content: state.activeTab.model.getValue(),
      });
    });

    window.sessionBridge.onRequestSave(() => {
      window.sessionBridge.saveToMain(sessionApi.collectSession());
    });
  }
);