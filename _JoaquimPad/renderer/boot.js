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
      const el = document.createElement("div");
      el.classList.add("tab");

      const btn = document.createElement("button");
      btn.textContent = tab.name;
      if (tab.active) btn.classList.add("active");
      btn.onclick = () => {
        tabManager.switchTab(tab.id);
        EditorCore.setText(tab.content);
        renderTabs();
      };

      const closeBtn = document.createElement("span");
      closeBtn.textContent = "×"; // ícone de fechar
      closeBtn.classList.add("close");
      closeBtn.onclick = (e) => {
        e.stopPropagation(); // não trocar aba ao clicar no X
        tabManager.closeTab(tab.id);
        renderTabs();
        const newActive = tabManager.getActiveTab();
        EditorCore.setText(newActive ? newActive.content : "");
      };

      el.appendChild(btn);
      el.appendChild(closeBtn);
      tabContainer.appendChild(el);
    });
  }


  window.menu.onCloseTab(() => {
    const active = tabManager.getActiveTab();
    if (active) {
      tabManager.closeTab(active.id);
      renderTabs();
      const newActive = tabManager.getActiveTab();
      if (newActive) {
        EditorCore.setText(newActive.content);
      } else {
        EditorCore.setText(""); // sem abas abertas
      }
    }
  });
  window.menu.onToggleWordWrap((enabled) => {
    EditorCore.editor.updateOptions({
      wordWrap: enabled ? "on" : "off"
    });
  });


};
