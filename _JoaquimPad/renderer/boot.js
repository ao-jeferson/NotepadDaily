import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";
import TabManager from "../core/editor/TabManager.js";

window.createEditor = () => {
  const container = document.getElementById("editor");
  const tabContainer = document.getElementById("tabs");
  const newTabBtn = document.getElementById("newTabBtn");

  // inicializa editor
  EditorCore.init(container);
  EditorCore.layout();
  window.addEventListener("resize", () => EditorCore.layout());

  // filesystem
  const fsService = new FileSystemService(EditorCore);
  fsService.attachEditorListeners();

  // statusbar
  const statusBar = new StatusBar(EditorCore);
  statusBar.init();

  // tab manager
  const tabManager = new TabManager();

  // cria primeira aba
  const firstTab = tabManager.createTab("");
  renderTabs();
  EditorCore.setText(firstTab.content);

  // botão nova aba
  newTabBtn.addEventListener("click", () => {
    const tab = tabManager.createTab("");
    renderTabs();
    EditorCore.setText(tab.content);
  });

  // sincronizar conteúdo da aba ativa
  EditorCore.onContentChange(() => {
    const active = tabManager.getActiveTab();
    if (active) {
      active.content = EditorCore.getText();
    }
  });

  // menu handlers
  window.menu.onNewFile(() => {
    const tab = tabManager.createTab("");
    renderTabs();
    EditorCore.setText("");
  });

  window.menu.onOpenFile(() => {
    fsService.openFile().then(() => {
      const content = EditorCore.getText();
      // nome da aba = nome do arquivo aberto
      const fileName = fsService.getCurrentFilePath()
        ? fsService.getCurrentFilePath().split(/[\\/]/).pop()
        : "Untitled";
      const tab = tabManager.createTab(content);
      tab.name = fileName;
      renderTabs();
      EditorCore.setText(content);
    });
  });

  window.menu.onSaveFile(() => fsService.saveFile());
  window.menu.onSaveAsFile(() => fsService.saveFileAs());

  // renderização das abas
  function renderTabs() {
    tabContainer.innerHTML = "";
    tabManager.tabs.forEach(tab => {
      const el = document.createElement("button");
      el.textContent = tab.name;
      if (tab.active) el.classList.add("active");
      el.onclick = () => {
        tabManager.switchTab(tab.id);
        EditorCore.setText(tab.content);
        renderTabs();
      };
      tabContainer.appendChild(el);
    });
  }
};
