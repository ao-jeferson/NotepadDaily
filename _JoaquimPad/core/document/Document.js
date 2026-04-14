export class Document {
  constructor({
    id,
    filePath = null,
    content = "",
    language = "plaintext",
    displayName = null
  }) {
    this.id = id;
    this.filePath = filePath;
    this.language = language;
    this.displayName = displayName;

    this._content = content;
    this._dirty = false;
    this._listeners = new Set();
  }

  /* =========================
   * Identity / UI
   * ========================= */

  getFileName() {
    if (this.filePath) {
      return this.filePath.split(/[\\/]/).pop();
    }
    return this.displayName || "Untitled";
  }

  isUntitled() {
    return this.filePath === null;
  }

  /* =========================
   * Content
   * ========================= */

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

  getSizeInBytes() {
    return new TextEncoder().encode(this._content).length;
  }

  /* =========================
   * Dirty
   * ========================= */

  isDirty() {
    return this._dirty;
  }

  markClean() {
    this._dirty = false;
    this._emit();
  }

  /* =========================
   * File binding
   * ========================= */

  setFilePath(path) {
    this.filePath = path;
    this.displayName = null; // ✅ troca nome temporário pelo real
    this._emit();
  }

  setLanguage(lang) {
    this.language = lang;
    this._emit();
  }

  /* =========================
   * Observers
   * ========================= */

  onChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _emit() {
    this._listeners.forEach(l => l(this));
  }

  /* =========================
   * Session
   * ========================= */

  toJSON() {
    return {
      id: this.id,
      filePath: this.filePath,
      content: this._content,
      language: this.language,
      displayName: this.displayName
    };
  }

  static fromJSON(data) {
    return new Document(data);
  }
}