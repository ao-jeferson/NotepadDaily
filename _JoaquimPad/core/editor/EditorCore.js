export const EditorCore = {
  editor: null,

  init(container) {
    const model = monaco.editor.createModel("", "plaintext");

    this.editor = monaco.editor.create(container, {
      model,
      theme: "vs-dark",
      automaticLayout: true,      
      fontSize: 14,
      lineNumbers: "on",
      wordWrap: "on",     
      autoIndent: "advanced",
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      mouseWheelZoom: true,
    });
  },

  setText(text) {
    if (this.editor) this.editor.setValue(text);
  },

  getText() {
    return this.editor ? this.editor.getValue() : "";
  },

  layout() {
    if (this.editor) this.editor.layout();
  },

  setLanguage(lang) {
    if (this.editor) {
      const model = this.editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, lang);
      }
    }
  },

  // ✅ Novo método encapsulado
  onContentChange(cb) {
    if (this.editor) {
      this.editor.onDidChangeModelContent(cb);
    }
  }
};
