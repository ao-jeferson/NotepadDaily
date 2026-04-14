const CONFIG_KEY = "smart-new-tab-enabled";

function getCurrentDisplayName() {
  const d = new Date();

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}-${mm} ${hh}-${min}`;
}

export class SmartNewTabFeature {
  constructor(tabManager, editorCore) {
    this.tabManager = tabManager;
    this.editorCore = editorCore;
  }

  /* =========================
   * Config
   * ========================= */

  isEnabled() {
    return localStorage.getItem(CONFIG_KEY) !== "false";
  }

  setEnabled(value) {
    localStorage.setItem(CONFIG_KEY, value ? "true" : "false");
  }

  /* =========================
   * Novo documento inteligente
   * ========================= */

  handleNewDocument(createFn) {
    const displayNameNow = getCurrentDisplayName();

    if (!this.isEnabled()) {
      return createFn(displayNameNow);
    }

    /* ✅ reutiliza SOMENTE se o nome for IGUAL */
    const existing = this.tabManager.tabs.find(
      (d) => d.filePath === null && d.displayName === displayNameNow,
    );

    if (existing) {
      this.tabManager.setActive(existing);
      this.editorCore.setDocument(existing);
      this.moveCursorToEnd();
      return existing;
    }

    return createFn(displayNameNow);
  }

  moveCursorToEnd() {
    const editor = this.editorCore.getEditor();
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const lastLine = model.getLineCount();
    const lastColumn = model.getLineLength(lastLine) + 1;

    editor.setPosition({
      lineNumber: lastLine,
      column: lastColumn,
    });

    editor.focus();
  }
  getCurrentDisplayName() {
    const d = new Date();

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");

    return `${dd}-${mm} ${hh}-${min}`;
  }

  /**/
}
