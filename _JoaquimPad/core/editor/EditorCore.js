import {
  detectLanguageFromName,
  detectLanguageFromContent,
} from "./detectLanguage.js";

export const EditorCore = {
  editor: null,
  model: null,
  currentDocument: null,

  /* =====================================================
     INIT (somente infraestrutura)
     ===================================================== */
  init(container) {
    this.editor = monaco.editor.create(container, {
      value: "",
      language: "plaintext",
      theme: "vs-white",
      automaticLayout: true,

      /* ✅ performance */
      minimap: { enabled: false },
      renderWhitespace: "selection",
      renderControlCharacters: false,
      wordWrap: "off",
      folding: false,
      smoothScrolling: false,
      cursorSmoothCaretAnimation: "off",

      /* ✅ UX */
      readOnly: false,
      cursorBlinking: "blink",
      multiCursorModifier: "ctrlCmd",
      mouseWheelZoom: true,

      find: {
        addExtraSpaceOnTop: false,
      },

      /* ✅ large files */
      largeFileOptimizations: true,
      detectIndentation: false,
    });

    /* ✅ viewport / scroll (LargeDocument ready) */
    this.editor.onDidScrollChange(() => {
      const editor = this.editor;
      if (!editor) return;

      const ranges = editor.getVisibleRanges();
      if (!ranges || ranges.length === 0) return;

      const visible = ranges[0];
      // aqui você pode chamar streaming / load more
      // visible.startLineNumber / endLineNumber
    });
  },

  /* =====================================================
     DOCUMENT
     ===================================================== */
  setDocument(document) {
    this.currentDocument = document;

    if (this.model) {
      this.model.dispose();
      this.model = null;
    }

    // ✅ detecta por nome se ainda não foi manual
    let language = document.language;
    if (!document.languageManuallySet) {
      language =
        detectLanguageFromName(document.filePath) ??
        detectLanguageFromContent(document.getContent()) ??
        "plaintext";

      document.language = language;
    }

    this.model = monaco.editor.createModel(document.getContent(), language);

    this.editor.setModel(this.model);

    this._setupAutoDetect();
  },
  /* =====================================================
     LANGUAGE / HIGHLIGHT
     ===================================================== */
  setLanguage(language) {
    if (!this.model) return;

    monaco.editor.setModelLanguage(this.model, language);

    if (this.currentDocument) {
      this.currentDocument.language = language;
    }
  },

  refreshModelLanguage() {
    if (!this.model || !this.currentDocument) return;

    monaco.editor.setModelLanguage(
      this.model,
      this.currentDocument.language || "plaintext",
    );
  },

  /* =====================================================
     ACCESS
     ===================================================== */
  getEditor() {
    return this.editor;
  },
  _setupAutoDetect() {
    if (!this.model || !this.currentDocument) return;

    let timeout;

    this.model.onDidChangeContent(() => {
      if (this.currentDocument.languageManuallySet) return;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const content = this.model.getValue();
        const detected = detectLanguageFromContent(content);

        if (detected && detected !== this.currentDocument.language) {
          this.currentDocument.language = detected;
          monaco.editor.setModelLanguage(this.model, detected);
        }
      }, 400);
    });
  },
};
