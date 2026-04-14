export class FileSystemService {
  constructor(editorCore) {
    this.editor = editorCore;
    this.currentFilePath = null;
    this.isDirty = false;
  }

  getCurrentFilePath() {
    return this.currentFilePath;
  }

  hasFileOpen() {
    return this.currentFilePath !== null;
  }

  markDirty() {
    this.isDirty = true;
  }

  clearDirty() {
    this.isDirty = false;
  }

  isModified() {
    return this.isDirty;
  }

  async openFile() {
    const filePath = await window.fs.openDialog();
    if (!filePath) return;

    const content = await window.fs.readFile(filePath);
    this.editor.setText(content);

    this.currentFilePath = filePath;
    this.clearDirty();
    this._updateWindowTitle();
  }

  async saveFile() {
    if (!this.currentFilePath) return this.saveFileAs();

    const content = this.editor.getText();
    await window.fs.writeFile(this.currentFilePath, content);

    this.clearDirty();
    this._updateWindowTitle();
  }

  async saveFileAs() {
    const filePath = await window.fs.saveDialog();
    if (!filePath) return;
    this.currentFilePath = filePath;
    await this.saveFile();
  }

  _updateWindowTitle() {
    const fileName = this.currentFilePath
      ? this.currentFilePath.split(/[\\/]/).pop()
      : "Untitled";
    const dirtyMark = this.isDirty ? " *" : "";
    window.app?.setWindowTitle?.(`_JoaquimPad — ${fileName}${dirtyMark}`);
  }

  attachEditorListeners() {
    this.editor.onContentChange(() => {
      this.markDirty();
      this._updateWindowTitle();
    });
  }
}
