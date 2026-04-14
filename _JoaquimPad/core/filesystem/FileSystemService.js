import { Document } from "../document/Document.js";

export class FileSystemService {
  async open() {
    const path = await window.fs.openDialog();
    if (!path) return null;

    const content = await window.fs.readFile(path);
    return new Document({
      id: crypto.randomUUID(),
      filePath: path,
      content
    });
  }

  async save(document) {
    if (!document.filePath) {
      return this.saveAs(document);
    }

    await window.fs.writeFile(
      document.filePath,
      document.getContent()
    );

    document.markClean();
  }

  async saveAs(document) {
    const path = await window.fs.saveDialog();
    if (!path) return;

    document.setFilePath(path);
    await this.save(document);
  }
}