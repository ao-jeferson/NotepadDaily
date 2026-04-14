export class StatusBar {
  constructor(editorCore) {
    this.editor = editorCore.getEditor();
    this.bar = document.getElementById("statusbar");
    this.document = null;
    this.cursorInfo = "";
  }

  init() {
    this.editor.onDidChangeCursorPosition(e => {
      const p = e.position;
      this.cursorInfo = `Ln ${p.lineNumber}  Col ${p.column}`;
      this.render();
    });
  }

  bindDocument(document) {
    if (this._dispose) this._dispose();

    this.document = document;
    this._dispose = document.onChange(() => this.render());
    this.render();
  }

  render() {
    if (!this.document || !this.bar) return;

    this.bar.textContent =
      // `${this.document.getFileName()}${this.document.isDirty() ? "*" : ""} | ` +
      `${this.cursorInfo} | ` +
      `Size ${this.document.getSizeInBytes()} B`;
  }
}