let editor;

export const EditorCore = {
  init(container) {
    editor = monaco.editor.create(container, {
      value: "",
      language: "plaintext",
      theme: "vs-dark",
      automaticLayout: true
    });
  },

  getText() {
    return editor.getValue();
  },

  setText(text) {
    editor.setValue(text);
  },

  onCursorChange(callback) {
    editor.onDidChangeCursorPosition(callback);
  }
};