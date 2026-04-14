let editor;

export const EditorCore = {
  init(container) {
    editor = monaco.editor.create(container, {
      language: "plaintext",
      theme: "vs-blue",
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: "on"
    });
  },

  layout() {
    if (editor) {
      editor.layout();
    }
  },

  getText() {
    return editor.getValue();
  },

  setText(text) {
    if (editor) {
      editor.setValue(text || "");
    }
  },

  onCursorChange(callback) {
    editor.onDidChangeCursorPosition(callback);
  },

  onContentChange(callback) {
    editor.onDidChangeModelContent(callback);
  },
  getSelectionLength() {
    const selection = editor.getSelection();
    if (selection.isEmpty()) return 0;

    const model = editor.getModel();
    const start = model.getOffsetAt(selection.getStartPosition());
    const end = model.getOffsetAt(selection.getEndPosition());
    return Math.abs(end - start);
  },
  getContentSize() {
    const text = editor.getValue();
    return new TextEncoder().encode(text).length; // bytes reais
  },
  onSelectionChange(callback) {
    editor.onDidChangeCursorSelection(() => {
      callback({
        selectionLength: this.getSelectionLength()
      });
    });
  }, getCursorPosition() {
    const pos = editor.getPosition();
    return {
      line: pos.lineNumber,
      column: pos.column
    };
  },
  getAbsolutePosition() {
    const model = editor.getModel();
    const pos = editor.getPosition();
    return model.getOffsetAt(pos) + 1; // 1-based
  },
  onCursorChange(callback) {
    editor.onDidChangeCursorPosition(() => {
      callback({
        ...this.getCursorPosition(),
        position: this.getAbsolutePosition()
      });
    });
  }, getSelectionLength() {
    const selection = editor.getSelection();
    if (selection.isEmpty()) return 0;

    const model = editor.getModel();
    const start = model.getOffsetAt(selection.getStartPosition());
    const end = model.getOffsetAt(selection.getEndPosition());
    return Math.abs(end - start);
  },
  getContentSize() {
    const text = editor.getValue();
    return new TextEncoder().encode(text).length; // bytes reais
  },
  onSelectionChange(callback) {
    editor.onDidChangeCursorSelection(() => {
      callback({
        selectionLength: this.getSelectionLength()
      });
    });
  }
  /**/
};
