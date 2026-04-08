require.config({ paths: { vs: "./monaco/vs" } });

require(["vs/editor/editor.main"], function () {
  const editor = monaco.editor.create(document.getElementById("editor"), {
    theme: "vs-white",
    automaticLayout: true,

    // ✅ INDENTAÇÃO
    tabSize: 2,
    insertSpaces: true,
    autoIndent: "advanced",

    // ✅ BOAS PRÁTICAS
    formatOnType: true,
    formatOnPaste: true,

    // ✅ INTELLISENSE
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: true,
  });

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
      { automaticLayout: true },
    );
    return diffEditor;
  }

  /* ================= TABS ================== */

  const tabs = [];
  let activeTab = null;
  const tabsDiv = document.getElementById("tabs");

  function setActiveTabLanguage(languageId) {
    if (!activeTab) return;

    monaco.editor.setModelLanguage(activeTab.model, languageId);
    updateStatus(); // atualiza status bar
  }

  function createTab(name, content) {
    const language = detectLanguage(name, content);
    const model = monaco.editor.createModel(content || "", language);

    const tab = {
      name: name || generateTabName(),
      model,
    };

    tabs.push(tab);
    activateTab(tab);
  }

  function setCurrentTabLanguage(languageId) {
    if (!activeTab) return;
    monaco.editor.setModelLanguage(activeTab.model, languageId);
  }

  function activateTab(tab) {
    ensureEditorMode();
    activeTab = tab;
    editor.setModel(tab.model);
    renderTabs();
    updateStatus();
  }
  async function saveActiveTab() {
    if (!activeTab) return;

    const path = await window.api.saveFile({
      path: null,
      content: activeTab.model.getValue(),
    });

    if (path) {
      activeTab.name = path.split(/[\\/]/).pop();
      renderTabs();
    }
  }

  function closeTab(tab) {
    if (!tab) return;

    ensureEditorMode();

    const index = tabs.indexOf(tab);
    if (index === -1) return;

    tab.model.dispose();
    tabs.splice(index, 1);

    if (tabs.length === 0) {
      createTab();
      return;
    }

    activateTab(tabs[index] || tabs[index - 1]);
  }
  function renderTabs() {
    tabsDiv.innerHTML = "";

    tabs.forEach((tab) => {
      const el = document.createElement("div");
      el.className = "tab" + (tab === activeTab ? " active" : "");
      el.textContent = tab.name;

      // ✅ Fechar com botão X
      const close = document.createElement("span");
      close.className = "close";
      close.textContent = "×";
      close.onclick = (e) => {
        e.stopPropagation();
        closeTab(tab);
      };

      // ✅ Fechar com clique do meio (scroll / roda do mouse)
      el.addEventListener("mousedown", (e) => {
        if (e.button === 1) {
          // 1 = botão do meio
          e.preventDefault();
          closeTab(tab);
        }
      });

      el.appendChild(close);
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
      modified: monaco.editor.createModel(activeTab.model.getValue()),
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
    if (pos)
      cursorPosEl.textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;
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

  editor.addCommand(
    monaco.KeyMod.k | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
    () => {
      editor.getAction("editor.action.formatDocument").run();
    },
  );

  let awaitingCtrlKD = false;

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
    // Ativa o modo "aguardando Ctrl+D"
    awaitingCtrlKD = true;

    // Cancela automaticamente após 1.5s (igual VS)
    setTimeout(() => {
      awaitingCtrlKD = false;
    }, 1500);
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
    if (!awaitingCtrlKD) return;

    awaitingCtrlKD = false;

    // ✅ Executa formatar documento
    editor.getAction("editor.action.formatDocument").run();
  });

  /* ================= MENU ================== */

  window.api.onNewTab(() => createTab());
  window.api.onCloseTab(() => closeTab(activeTab));
  window.api.onOpen(async () => {
    const r = await window.api.openFile();
    if (r) createTab(r.path.split(/[\\/]/).pop(), r.content);
  });

  window.diffAPI.onDiffPrevious(() => diffWithPreviousTab());
  window.diffAPI.onDiffExit(() => ensureEditorMode());
  window.languageAPI.onSetLanguage((languageId) => {
    setActiveTabLanguage(languageId);
  });
  window.api.onCloseTab(() => closeTab(activeTab));

  window.api.onSave(() => {
    saveActiveTab();
  });

  /* ================= SESSION ================== */

  function collectSession() {
    return {
      index: tabs.indexOf(activeTab),
      tabs: tabs.map((t) => ({ name: t.name, content: t.model.getValue() })),
    };
  }

  function detectLanguageByFilename(filename) {
    if (!filename) return "plaintext";

    const ext = filename.split(".").pop().toLowerCase();

    const map = {
      js: "javascript",
      ts: "typescript",
      json: "json",
      html: "html",
      css: "css",
      scss: "scss",
      md: "markdown",
      xml: "xml",
      py: "python",
      java: "java",
      cs: "csharp",
      cpp: "cpp",
      c: "c",
      go: "go",
      php: "php",
      rb: "ruby",
      rs: "rust",
      sql: "sql",
      yaml: "yaml",
      yml: "yaml",
      sh: "shell",
      bat: "bat",
      ps1: "powershell",
    };

    return map[ext] || "plaintext";
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
  function detectLanguageByContent(text) {
    if (!text) return "plaintext";

    const t = text.trim();

    // HTML
    if (/^<!DOCTYPE html>|<\/html>/i.test(t)) return "html";

    // JSON
    if (/^\s*[{[]/.test(t) && /"\s*:/.test(t)) return "json";

    // JavaScript / TypeScript
    if (/\b(function|const|let|var|=>|import|export)\b/.test(t))
      return "javascript";

    // Python
    if (/\b(def |import |from |print\(|class )/.test(t)) return "python";

    // C#
    if (/\b(using |namespace |class |public |void |static)\b/.test(t))
      return "csharp";

    // Java
    if (/\b(public class |static void main|System\.out\.println)\b/.test(t))
      return "java";

    // SQL
    if (/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i.test(t)) return "sql";

    // Shell
    if (/^#!/.test(t) || /\b(echo |cd |ls |chmod )/.test(t)) return "shell";

    // Markdown
    if (/^# |```|\*\*.+\*\*/.test(t)) return "markdown";

    return "plaintext";
  }
  function detectLanguageByFilename(filename) {
    if (!filename || !filename.includes(".")) return null;

    const ext = filename.split(".").pop().toLowerCase();

    const map = {
      js: "javascript",
      ts: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      py: "python",
      cs: "csharp",
      java: "java",
      sql: "sql",
      sh: "shell",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
    };

    return map[ext] || null;
  }

  function detectLanguage(name, content) {
    // 1️⃣ Tenta pela extensão
    const byName = detectLanguageByFilename(name);
    if (byName) return byName;

    // 2️⃣ Fallback: conteúdo
    return detectLanguageByContent(content);
  }
  function updateStatus() {
    const model = editor.getModel();
    if (model) {
      languageEl.textContent = model.getLanguageId();
    }
  }

  async function restoreSession() {
    const s = await window.sessionAPI.load();
    if (!s) return false;
    s.tabs.forEach((t) => createTab(t.name, t.content));
    if (tabs[s.index]) activateTab(tabs[s.index]);
    return true;
  }

  window.addEventListener("beforeunload", () =>
    window.sessionAPI.save(collectSession()),
  );
  window.languageAPI.onSetLanguage((lang) => {
    setCurrentTabLanguage(lang);
    updateStatus(); // atualizar status bar
  });

  restoreSession().then((r) => {
    if (!r) createTab();
  });
  window.addEventListener("keydown", (e) => {
    // Salvar
    if (e.ctrlKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (!activeTab) return;

      window.api
        .saveFile({
          path: null,
          content: activeTab.model.getValue(),
        })
        .then((path) => {
          if (path) activeTab.name = path.split(/[\\/]/).pop();
          renderTabs();
        });
    }

    // Ctrl+S
    if (e.ctrlKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveActiveTab();
    }

    // Fechar aba
    if (e.ctrlKey && e.key.toLowerCase() === "w") {
      e.preventDefault();
      closeTab(activeTab);
    }

    // Abrir arquivo
    if (e.ctrlKey && e.key.toLowerCase() === "o") {
      e.preventDefault();
      window.api.openFile().then((r) => {
        if (r) createTab(r.path.split(/[\\/]/).pop(), r.content);
      });
    }
    //Intelisense
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.css.cssDefaults.setOptions({
      validate: true,
    });
    monaco.languages.register({ id: "csharp" });
    monaco.languages.register({ id: "python" });

    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: () => {
        return {
          suggestions: [
            {
              label: "if __name__ == '__main__'",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "if __name__ == '__main__':\n    ${1}",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRules.InsertAsSnippet,
              documentation: "Entry point do Python",
            },
          ],
        };
      },
    });
  });

  monaco.languages.registerCompletionItemProvider("csharp", {
    provideCompletionItems: () => {
      return {
        suggestions: [
          {
            label: "using",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "using System;",
          },
          {
            label: "Console.WriteLine",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "Console.WriteLine(${1});",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRules.InsertAsSnippet,
            documentation: "Imprime no console",
          },
          {
            label: "class",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "class ${1:MyClass}\n{\n    ${2}\n}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRules.InsertAsSnippet,
            documentation: "Declaração de classe C#",
          },
          {
            label: "Main",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "static void Main(string[] args)\n{\n    ${1}\n}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRules.InsertAsSnippet,
            documentation: "Método de entrada do programa",
          },
        ],
      };
    },
  });
});
