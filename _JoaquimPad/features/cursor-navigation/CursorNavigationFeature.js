const MAX_HISTORY = 100;

export class CursorNavigationFeature {
  constructor(editorCore, tabManager) {
    this.editorCore = editorCore;
    this.tabManager = tabManager;

    this.editor = null;

    this.backStack = [];
    this.forwardStack = [];

    this.listeners = new Set();
    this.ignoreNext = false;
  }

  init() {
    this.editor = this.editorCore.getEditor();
    if (!this.editor) return;

    this.editor.onDidChangeCursorPosition((e) => {
      if (this.ignoreNext) {
        this.ignoreNext = false;
        return;
      }

      const doc = this.tabManager.getActive();
      if (!doc) return;

      const last = this.backStack.at(-1);
      if (
        last &&
        last.docId === doc.id &&
        last.line === e.position.lineNumber &&
        last.col === e.position.column
      ) {
        return;
      }

      this.backStack.push({
        docId: doc.id,
        line: e.position.lineNumber,
        col: e.position.column,
      });

      this.forwardStack.length = 0;
      this.emit();
    });
  }

  /* ===== API pública ===== */

  back() {
    if (!this.canGoBack()) return;

    this.ignoreNext = true;
    const current = this.backStack.pop();
    this.forwardStack.push(current);

    this.goTo(this.backStack.at(-1));
    this.emit();
  }

  forward() {
    if (!this.canGoForward()) return;

    this.ignoreNext = true;
    const next = this.forwardStack.pop();
    this.backStack.push(next);

    this.goTo(next);
    this.emit();
  }

  canGoBack() {
    return this.backStack.length > 1;
  }

  canGoForward() {
    return this.forwardStack.length > 0;
  }

  onStateChange(cb) {
    this.listeners.add(cb);
    cb(this.state()); // estado inicial
  }

  state() {
    return {
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward(),
    };
  }

  /* ===== Interno ===== */

  goTo(entry) {
    const doc = this.tabManager.tabs.find((d) => d.id === entry.docId);
    if (!doc) return;

    this.tabManager.setActive(doc);
    this.editorCore.setDocument(doc);

    this.editor.setPosition({
      lineNumber: entry.line,
      column: entry.col,
    });
    this.editor.revealPositionInCenter();
    this.editor.focus();
  }

  emit() {
    const state = this.state();
    this.listeners.forEach((l) => l(state));
  }

  serialize() {
    return {
      back: this.backStack,
      forward: this.forwardStack,
    };
  }

  restore(data) {
    if (!data) return;
    this.backStack = data.back || [];
    this.forwardStack = data.forward || [];
    this.emit();
  }
}
