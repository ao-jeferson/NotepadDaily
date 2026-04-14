export const EditorCore = {
  editor: null,
  currentDocument: null,

  init(container) {
    const model = monaco.editor.createModel("", "plaintext");

    this.editor = monaco.editor.create(container, {
      model,
      theme: "vs-dark",
      automaticLayout: true,

      // ✅ garante atalhos e comandos padrão
      readOnly: false,
      renderWhitespace: "selection",
      cursorBlinking: "blink",
      multiCursorModifier: "ctrlCmd",
      find: {
        addExtraSpaceOnTop: false
      }
    });

    this.editor.onDidChangeModelContent(() => {
      if (this.currentDocument) {
        this.currentDocument.setContent(
          this.editor.getValue()
        );
      }
    });
  },

  setDocument(document) {
    this.currentDocument = document;

    if (!document) {
      this.editor.setValue("");
      return;
    }

    this.editor.setValue(document.getContent());

    const model = this.editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(
        model,
        document.language || "plaintext"
      );
    }
  },

  getEditor() {
    return this.editor;
  }
};