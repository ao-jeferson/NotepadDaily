export class StatusBar {
  constructor(editorCore) {
    this.editor = editorCore.editor;
    this.statusbar = document.getElementById("statusbar");
  }

  init() {
    if (!this.editor || !this.statusbar) return;

    // posição do cursor
    this.editor.onDidChangeCursorPosition((e) => {
      const pos = e.position;
      this.updateStatus(`Ln ${pos.lineNumber}, Col ${pos.column}`);
    });

    // seleção
    this.editor.onDidChangeCursorSelection((e) => {
      const sel = e.selection;
      this.updateStatus(
        `Ln ${sel.startLineNumber}, Col ${sel.startColumn} - Ln ${sel.endLineNumber}, Col ${sel.endColumn}`
      );
    });
  }
  
updateStatus(text) {
  if (this.statusbar) {
    this.statusbar.textContent = text;
  }
}

}
