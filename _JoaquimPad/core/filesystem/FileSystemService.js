export class FileSystemService {
  constructor(editor) {
    this.editor = editor;
    this.currentPath = null;
  }

  async openFile(path) {
    const content = await window.fs.readFile(path);
    this.editor.setText(content);
    this.currentPath = path;
  }

  async save() {
    if (!this.currentPath) return;
    const text = this.editor.getText();
    await window.fs.writeFile(this.currentPath, text);
  }
}