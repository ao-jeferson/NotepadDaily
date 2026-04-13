let editorInstance = null;

window.createEditor = function () {
  editorInstance = monaco.editor.create(
    document.getElementById("editor"),
    {
      value: "Hello from Electron + Monaco 🚀",
      language: "plaintext",
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false }
    }
  );
};

// API mínima (seu Core começa aqui)
window.EditorCore = {
  getText() {
    return editorInstance.getValue();
  },

  setText(text) {
    editorInstance.setValue(text);
  },

  undo() {
    editorInstance.trigger("keyboard", "undo", null);
  },

  redo() {
    editorInstance.trigger("keyboard", "redo", null);
  }
};