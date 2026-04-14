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
  EditorCore.editor.onDidChangeModelContent(() => {
    const active = tabManager.getActiveTab();
    if (active) active.content = EditorCore.getText();
  });

  // menu: novo arquivo
  window.menu.onNewFile(() => {
    const tab = tabManager.createTab("");
    renderTabs();
    EditorCore.setText("");
  });

  // menu: abrir arquivo
  window.menu.onOpenFile(() => {
    fsService.openFile().then(() => {
      const content = EditorCore.getText();
      const fileName = fsService.getCurrentFilePath()
        ? fsService.getCurrentFilePath().split(/[\\/]/).pop()
        : "";
      const lang = detectLanguage(fileName);
      const tab = tabManager.createTab(content, fileName, lang);
      renderTabs();
      EditorCore.setText(content);

      const model = EditorCore.editor.getModel();
      if (model) monaco.editor.setModelLanguage(model, lang);
    });
  });

  // menu: salvar
  window.menu.onSaveFile(() => fsService.saveFile());
  window.menu.onSaveAsFile(() => fsService.saveFileAs());

  // menu: fechar aba
  window.menu.onCloseTab(() => {
    const active = tabManager.getActiveTab();
    if (active) {
      tabManager.closeTab(active.id);
      renderTabs();
      const newActive = tabManager.getActiveTab();
      if (newActive) {
        EditorCore.setText(newActive.content);
        const model = EditorCore.editor.getModel();
        if (model) monaco.editor.setModelLanguage(model, newActive.language);
      } else {
        EditorCore.setText("");
      }
    }
  });

  // menu: Word Wrap
  window.menu.onToggleWordWrap((enabled) => {
    if (EditorCore.editor) {
      EditorCore.editor.updateOptions({
        wordWrap: enabled ? "on" : "off"
      });
    }
  });

  // menu: Linguagem
  window.menu.onSetLanguage((lang) => {
    const active = tabManager.getActiveTab();
    if (active && EditorCore.editor) {
      let model = EditorCore.editor.getModel();
      if (!model) {
        model = monaco.editor.createModel(EditorCore.getText(), lang);
        EditorCore.editor.setModel(model);
      } else {
        monaco.editor.setModelLanguage(model, lang);
      }
      active.language = lang;
      renderTabs();
    }
  });

  // renderização das abas
  function renderTabs() {
    tabContainer.innerHTML = "";
    tabManager.tabs.forEach(tab => {
      const el = document.createElement("div");
      el.classList.add("tab");

      const btn = document.createElement("button");
      btn.textContent = `${tab.name} [${tab.language}]`;
      if (tab.active) btn.classList.add("active");
      btn.onclick = () => {
        tabManager.switchTab(tab.id);
        EditorCore.setText(tab.content);

        const model = EditorCore.editor.getModel();
        if (model) monaco.editor.setModelLanguage(model, tab.language);

        renderTabs();
      };

      const closeBtn = document.createElement("span");
      closeBtn.textContent = "×";
      closeBtn.classList.add("close");
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        tabManager.closeTab(tab.id);
        renderTabs();
        const newActive = tabManager.getActiveTab();
        if (newActive) {
          EditorCore.setText(newActive.content);
          const model = EditorCore.editor.getModel();
          if (model) monaco.editor.setModelLanguage(model, newActive.language);
        } else {
          EditorCore.setText("");
        }
      };

      el.appendChild(btn);
      el.appendChild(closeBtn);
      tabContainer.appendChild(el);
    });
  }

  // detecção automática de linguagem pelo nome do arquivo
  function detectLanguage(fileName) {
    if (fileName.endsWith(".js")) return "javascript";
    if (fileName.endsWith(".ts")) return "typescript";
    if (fileName.endsWith(".py")) return "python";
    if (fileName.endsWith(".html")) return "html";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".json")) return "json";
    if (fileName.endsWith(".md")) return "markdown";
    if (fileName.endsWith(".java")) return "java";
    if (fileName.endsWith(".c")) return "c";
    if (fileName.endsWith(".cpp")) return "cpp";
    if (fileName.endsWith(".cs")) return "csharp";
    if (fileName.endsWith(".go")) return "go";
    if (fileName.endsWith(".rs")) return "rust";
    if (fileName.endsWith(".php")) return "php";
    if (fileName.endsWith(".sql")) return "sql";
    if (fileName.endsWith(".yml") || fileName.endsWith(".yaml")) return "yaml";
    return "plaintext";
  }
};
