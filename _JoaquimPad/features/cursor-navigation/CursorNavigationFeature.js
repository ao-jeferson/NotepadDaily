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

  /* =====================================================
     INIT
     ===================================================== */
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

      if (this.backStack.length > MAX_HISTORY) {
        this.backStack.shift();
      }

      this.forwardStack.length = 0;
      this._emitState();
    });
  }

  /* =====================================================
     API PÚBLICA (UI)
     ===================================================== */

  canGoBack() {
    return this.backStack.length > 1;
  }

  canGoForward() {
    return this.forwardStack.length > 0;
  }

  back() {
    if (!this.canGoBack()) return;

    const current = this.backStack.pop();
    this.forwardStack.push(current);

    const target = this.backStack.at(-1);
    this._goTo(target);
    this._emitState();
  }

  forward() {
    if (!this.canGoForward()) return;

    const target = this.forwardStack.pop();
    this.backStack.push(target);

    this._goTo(target);
    this._emitState();
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

  /* =====================================================
     ✅ LIMPEZA AO FECHAR ABA
     ===================================================== */
  onTabClosed(tabId) {
    this.backStack = this.backStack.filter(
      (h) => h.docId !== tabId
    );

    this.forwardStack = this.forwardStack.filter(
      (h) => h.docId !== tabId
    );

    this._emitState();
  }

  /* =====================================================
     NAVEGAÇÃO REAL
     ===================================================== */
  _goTo(entry) {
    if (!entry) return;

    const doc = this.tabManager.tabs.find(
      (t) => t.id === entry.docId
    );
    if (!doc) return;

    this.ignoreNext = true;

    this.tabManager.setActive(doc);
    this.editorCore.setDocument(doc);

    const editor = this.editor;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const maxLine = model.getLineCount();
    let line = Math.min(entry.line, maxLine);
    let column = Math.max(1, entry.col);

    const maxColumn = model.getLineLength(line) + 1;
    column = Math.min(column, maxColumn);

    const position = { lineNumber: line, column };

    editor.setPosition(position);
    editor.revealPositionInCenter(position);
    editor.focus();
  }

  _emitState() {
    const state = this.state();
    this.listeners.forEach((l) => l(state));
  }

  /* =====================================================
     SESSION
     ===================================================== */
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
    this._emitState();
  }
}