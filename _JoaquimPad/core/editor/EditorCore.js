import {
  detectLanguageFromName,
  detectLanguageFromContent,
} from "./detectLanguage.js";

import { LANGUAGE_INDENTATION } from "./languageIndentation.js";

export const EditorCore = {
  editor: null,
  model: null,
  currentDocument: null,

  /* =====================================================
     INIT
     ===================================================== */
  init(container) {
    this.editor = monaco.editor.create(container, {
      value: "",
      language: "plaintext",
      theme: "vs-white",
      automaticLayout: true,

      /* performance */
      minimap: { enabled: false },
      renderWhitespace: "selection",
      renderControlCharacters: false,
      wordWrap: "off",
      folding: false,
      smoothScrolling: false,
      cursorSmoothCaretAnimation: "off",

      /* UX */
      readOnly: false,
      cursorBlinking: "blink",
      multiCursorModifier: "ctrlCmd",
      mouseWheelZoom: true,

      find: { addExtraSpaceOnTop: false },

      /* large files */
      largeFileOptimizations: true,
      detectIndentation: false,
    });

    /* -----------------------------------------------------
       SCROLL / VIEWPORT (LargeDocument ready)
       --------------------------------------------------- */
    this.editor.onDidScrollChange(() => {
      const ranges = this.editor.getVisibleRanges();
      if (!ranges || !ranges.length) return;
      const visible = ranges[0];
      // streaming futuro aqui
    });

    /* -----------------------------------------------------
       MONACO SHORTCUTS (VS CODE STYLE)
       --------------------------------------------------- */
    const editor = this.editor;

    // Comentário
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash,
      () => editor.getAction("editor.action.commentLine")?.run()
    );

    // Duplicar linha
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
      () => editor.getAction("editor.action.copyLinesDownAction")?.run()
    );

    // Mover linhas
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.DownArrow,
      () => editor.getAction("editor.action.moveLinesDownAction")?.run()
    );

    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.UpArrow,
      () => editor.getAction("editor.action.moveLinesUpAction")?.run()
    );

    // Busca / navegação
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
      () => editor.getAction("actions.find")?.run()
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH,
      () => editor.getAction("editor.action.startFindReplaceAction")?.run()
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG,
      () => editor.getAction("editor.action.gotoLine")?.run()
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL,
      () => editor.getAction("editor.action.selectLine")?.run()
    );

    // Ctrl+K Ctrl+D → format document
    editor.addCommand(
      monaco.KeyMod.chord(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD
      ),
      () => editor.getAction("editor.action.formatDocument")?.run()
    );

    // Go To Definition
    editor.addCommand(
      monaco.KeyCode.F12,
      () => editor.getAction("editor.action.revealDefinition")?.run()
    );

    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.F12,
      () => editor.getAction("editor.action.peekDefinition")?.run()
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.F12,
      () => editor.getAction("editor.action.goToImplementation")?.run()
    );

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.F12,
      () => editor.getAction("editor.action.goToTypeDefinition")?.run()
    );

    // Ctrl + Click → Go to Definition
    editor.onMouseDown((e) => {
      if (
        (e.event.ctrlKey || e.event.metaKey) &&
        e.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT
      ) {
        editor.getAction("editor.action.revealDefinition")?.run();
      }
    });
  },

  /* =====================================================
     DOCUMENT
     ===================================================== */
  setDocument(document) {
    this.currentDocument = document;

    if (this.model) {
      this.model.dispose();
    }

    let language = document.language;
    if (!document.languageManuallySet) {
      language =
        detectLanguageFromName(document.filePath) ??
        detectLanguageFromContent(document.getContent()) ??
        "plaintext";
      document.language = language;
    }

    this.model = monaco.editor.createModel(
      document.getContent(),
      language
    );

    this.editor.setModel(this.model);

    this._applyIndentation(language);
    this._setupAutoDetect();
  },

  /* =====================================================
     LANGUAGE / INDENTATION
     ===================================================== */
  setLanguage(language) {
    if (!this.model) return;

    monaco.editor.setModelLanguage(this.model, language);

    if (this.currentDocument) {
      this.currentDocument.language = language;
      this.currentDocument.languageManuallySet = true;
    }

    this._applyIndentation(language);
  },

  _applyIndentation(language) {
    if (!this.model) return;

    const config =
      LANGUAGE_INDENTATION[language] ||
      LANGUAGE_INDENTATION.plaintext;

    this.model.updateOptions({
      tabSize: config.tabSize,
      insertSpaces: config.insertSpaces,
    });

    this.editor.updateOptions({
      autoIndent: "advanced",
    });
  },

 _setupAutoDetect() {
  if (!this.model || !this.currentDocument) return;

  let timeout;

  this.model.onDidChangeContent(() => {
    // ✅ 1. SINCRONIZA o conteúdo do editor com o Document
    const value = this.model.getValue();
    this.currentDocument.setContent(value);

    // ✅ 2. Se a linguagem foi escolhida manualmente, não auto-detecta
    if (this.currentDocument.languageManuallySet) return;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const detected = detectLanguageFromContent(value);

      if (
        detected &&
        detected !== this.currentDocument.language
      ) {
        this.currentDocument.language = detected;
        monaco.editor.setModelLanguage(this.model, detected);
        this._applyIndentation(detected);
      }
    }, 400);
  });
},

  getEditor() {
    return this.editor;
  },
};