export class StatusBar {
  constructor(editorCore) {
    this.editor = editorCore;
    this.element = document.createElement("div");

    this.state = {
      line: 1,
      column: 1,
      position: 1,
      selection: 0,
      size: 0
    };
  }

  init() {
    this.element.className = "status-bar";
    document.body.appendChild(this.element);

    // Cursor
    this.editor.onCursorChange((info) => {
      this.state.line = info.line;
      this.state.column = info.column;
      this.state.position = info.position;
      this._render();
    });

    // Seleção
    this.editor.onSelectionChange((info) => {
      this.state.selection = info.selectionLength;
      this._render();
    });

    // Conteúdo (tamanho do arquivo)
    this.editor.onContentChange(() => {
      this.state.size = this.editor.getContentSize();
      this._render();
    });

    // inicial
    this.state.size = this.editor.getContentSize();
    this._render();
  }

  _render() {
    this.element.innerText =
      `Ln : ${this.state.line}   ` +
      `Col : ${this.state.column}   ` +
      `Pos : ${this.state.position}   ` +
      `Sel : ${this.state.selection}   ` +
      `Size : ${this._formatSize(this.state.size)}`;
  }

  _formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}