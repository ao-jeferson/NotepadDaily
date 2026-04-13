export class StatusBar {
  constructor(editor) {
    this.editor = editor;
    this.element = document.createElement("div");
  }

  init() {
    this.element.className = "status-bar";
    document.body.appendChild(this.element);

    this.editor.onCursorChange(e => {
      this.element.innerText =
        `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });
  }
}