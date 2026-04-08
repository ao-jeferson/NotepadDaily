require.config({
  paths: {
    vs: "./monaco/vs",
    editor: "./editor"
  }
});

require(
  [
    "vs/editor/editor.main",
    "editor/editor",
    "editor/tabs",
    "editor/session"
  ],
  function (_monaco, editorApi, tabsApi, sessionApi) {

    editorApi.createEditor(document.getElementById("editor"));

    sessionApi.restoreSession().then(restored => {
      if (!restored) {
        tabsApi.createTab();
      }
    });

    window.api.onNewTab(() => tabsApi.createTab());

    window.sessionBridge.onRequestSave(() => {
      window.sessionBridge.saveToMain(
        sessionApi.collectSession()
      );
    });
  }
);