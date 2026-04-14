const MAX_HISTORY = 100;

export class CursorNavigationFeature {
  constructor(editorCore, tabManager) {
    this.editorCore = editorCore;
    this.tabManager = tabManager;
    this.editor = null;

    this.globalBack = [];
    this.globalForward = [];

    this.ignoreNext = false;
  }

  init() {
    this.editor = this.editorCore.getEditor();
    if (!this.editor) return;

    this.editor.onDidChangeCursorPosition(e => {
      if (this.ignoreNext) {
        this.ignoreNext = false;
        return;
      }

      const doc = this.tabManager.getActive();
      if (!doc) return;

      const entry = {
        docId: doc.id,
        position: { ...e.position }
      };

      const last = this.globalBack[this.globalBack.length - 1];
      if (
        last &&
        last.docId === entry.docId &&
        last.position.lineNumber === entry.position.lineNumber &&
        last.position.column === entry.position.column
      ) {
        return;
      }

      this.globalBack.push(entry);
      if (this.globalBack.length > MAX_HISTORY) {
        this.globalBack.shift();
      }

      this.globalForward.length = 0;
    });
  }

  back() {
    if (this.globalBack.length < 2) return;

    this.ignoreNext = true;
    const current = this.globalBack.pop();
    this.globalForward.push(current);

    const prev = this.globalBack[this.globalBack.length - 1];
    this._go(prev);
  }

  forward() {
    if (this.globalForward.length === 0) return;

    this.ignoreNext = true;
    const next = this.globalForward.pop();
    this.globalBack.push(next);
    this._go(next);
  }

  _go(entry) {
    const doc = this.tabManager.tabs.find(d => d.id === entry.docId);
    if (!doc) return;

    this.tabManager.setActive(doc);
    this.editorCore.setDocument(doc);

    this.editor.setPosition(entry.position);
    this.editor.revealPositionInCenter(entry.position);
    this.editor.focus();
  }

  /* =========================
   * Session integration
   * ========================= */

  serialize() {
    return {
      back: this.globalBack,
      forward: this.globalForward
    };
  }

  restore(data) {
    if (!data) return;
    this.globalBack = data.back || [];
    this.globalForward = data.forward || [];
  }
}