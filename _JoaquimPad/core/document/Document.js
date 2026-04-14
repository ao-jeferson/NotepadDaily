export class Document {
  constructor({
    id,
    filePath = null,
    content = "",
    language = "plaintext",
    displayName = null,
    pinned = false,
  }) {
    this.id = id;
    this.filePath = filePath;
    this.language = language;
    this.displayName = displayName;
    this.pinned = pinned;

    /* ✅ FONTE ÚNICA DE VERDADE */
    this._content = content;

    this._dirty = false;
    this._listeners = new Set();

    this.languageManuallySet = false;
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
   * Content (SINGLE SOURCE)
   * ========================= */

  getContent() {
    return this._content || "";
  }

  setContent(content) {
    if (content === this._content) return;
    this._content = content;
    this.markDirty();
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

  markDirty() {
    this._dirty = true;
    this._emit();
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
    this.displayName = null;
    this._emit();
  }

  setLanguage(language, manual = true) {
    this.language = language;
    if (manual) {
      this.languageManuallySet = true;
    }
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
    this._listeners.forEach((l) => l(this));
  }

  /* =========================
   * Session (PERSISTÊNCIA)
   * ========================= */

  toJSON() {
    return {
      id: this.id,
      filePath: this.filePath,
      content: this._content,              // ✅ correto
      language: this.language,
      displayName: this.displayName,
      pinned: !!this.pinned,
      languageManuallySet: !!this.languageManuallySet,
    };
  }

  static fromJSON(data) {
    const doc = new Document(data);
    doc.languageManuallySet = !!data.languageManuallySet;
    doc._dirty = false; // sessão começa limpa
    return doc;
  }
}