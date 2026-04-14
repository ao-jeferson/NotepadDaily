export class Document {
  constructor({ id, filePath = null, content = "", language = "plaintext" }) {
    this.id = id;
    this.filePath = filePath;
    this.language = language;

    this._content = content;
    this._dirty = false;
    this._listeners = new Set();
  }

  getFileName() {
    return this.filePath ? this.filePath.split(/[\\/]/).pop() : "Untitled";
  }

  getContent() {
    return this._content;
  }

  setContent(content, silent = false) {
    this._content = content;
    if (!silent) {
      this._dirty = true;
      this._emit();
    }
  }

  isDirty() {
    return this._dirty;
  }

  markClean() {
    this._dirty = false;
    this._emit();
  }

  onChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _emit() {
    this._listeners.forEach((l) => l(this));
  }

  toJSON() {
    return {
      id: this.id,
      filePath: this.filePath,
      content: this._content,
      language: this.language,
    };
  }

  getSizeInBytes() {
    // Usa TextEncoder para contar bytes reais (UTF‑8)
    return new TextEncoder().encode(this._content).length;
  }

  static fromJSON(data) {
    return new Document(data);
  }
}
