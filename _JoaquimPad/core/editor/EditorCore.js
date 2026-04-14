export const EditorCore = {
  editor: null,
  currentDocument: null,

  init(container) {
    const model = monaco.editor.createModel("", "plaintext");

    this.editor = monaco.editor.create(container, {
      model,
      theme: "vs-dark",
      automaticLayout: true
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

    this.editor.setValue(document.getContent());
    monaco.editor.setModelLanguage(
      this.editor.getModel(),
      document.language
    );
  },

  getEditor() {
    return this.editor;
  }
};
