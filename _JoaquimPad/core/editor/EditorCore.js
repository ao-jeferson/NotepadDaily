export const EditorCore = {
  editor: null,
  currentDocument: null,

  init(container) {
    const model = monaco.editor.createModel("", "plaintext");

    this.editor = monaco.editor.create(container, {
      model,
      theme: "vs-white",
      automaticLayout: true,

      // ✅ performance
      minimap: { enabled: false }, // DESLIGAR
      renderWhitespace: "none",
      renderControlCharacters: false,
      wordWrap: "off", // MUITO importante
      folding: false, // opcional
      smoothScrolling: false,
      cursorSmoothCaretAnimation: "off",

      // ✅ garante atalhos e comandos padrão
      readOnly: false,
      renderWhitespace: "selection",
      cursorBlinking: "blink",
      multiCursorModifier: "ctrlCmd",
      mouseWheelZoom: true,
      find: {
        addExtraSpaceOnTop: false,
      },

      // ✅ arquivos grandes
      largeFileOptimizations: true,
      detectIndentation: false,
    });

    this.editor.onDidScrollChange(() => {
      const editor = this.editor; // ✅ NÃO o model
      if (!editor) return;

      const ranges = editor.getVisibleRanges();
      if (!ranges || ranges.length === 0) return;

      const visible = ranges[0];

      // Aqui você chama o LargeDocument / FileSystemService
    });
  },

  setDocument(document) {
    this.currentDocument = document;

    if (document.isLargeFile) {
      this.editor.updateOptions({
        readOnly: true,
        wordWrap: "off",
        minimap: { enabled: false },
      });
    } else {
      this.editor.updateOptions({
        readOnly: false,
      });
    }

    this.editor.setValue(document.getContent());
  },

  getEditor() {
    return this.editor;
  },

  /** */
};
