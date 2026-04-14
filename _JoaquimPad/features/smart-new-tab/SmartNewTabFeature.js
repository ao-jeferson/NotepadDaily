const CONFIG_KEY = "smart-new-tab-enabled";

/**
 * Feature responsável por controlar o comportamento
 * de criação e reutilização de novos arquivos (Untitled).
 */
export class SmartNewTabFeature {
  constructor(tabManager, editorCore) {
    this.tabManager = tabManager;
    this.editorCore = editorCore;
  }

  /* =====================================================
     CONFIGURAÇÃO (Menu)
     ===================================================== */

  isEnabled() {
    return localStorage.getItem(CONFIG_KEY) !== "false";
  }

  setEnabled(enabled) {
    localStorage.setItem(
      CONFIG_KEY,
      enabled ? "true" : "false"
    );
  }

  /* =====================================================
     NOVO DOCUMENTO INTELIGENTE
     ===================================================== */

  /**
   * Cria ou reutiliza um documento "Untitled"
   * conforme a configuração ativa.
   *
   * @param {Function} createFn função que cria um novo documento
   */
  handleNewDocument(createFn) {
    const displayName = this.getCurrentDisplayName();

    // 🔴 Feature desligada → sempre cria novo
    if (!this.isEnabled()) {
      return createFn(displayName);
    }

    // ✅ Reutiliza SOMENTE se o nome bater
    const existing = this.tabManager.tabs.find(
      doc =>
        doc.filePath === null &&
        doc.displayName === displayName
    );

    if (existing) {
      this.tabManager.setActive(existing);
      this.editorCore.setDocument(existing);
      this.moveCursorToEnd();
      return existing;
    }

    return createFn(displayName);
  }

  /* =====================================================
     DATA / NOME DO DOCUMENTO
     ===================================================== */

  /**
   * Gera o nome incremental baseado em data/hora.
   * Exemplo: 14-04 11-58
   */
  getCurrentDisplayName() {
    const d = new Date();

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");

    return `${dd}-${mm} ${hh}-${min}`;
  }

  /* =====================================================
     UTILITÁRIOS
     ===================================================== */

  /**
   * Move o cursor para o final do documento reutilizado.
   */
  moveCursorToEnd() {
    const editor = this.editorCore.getEditor();
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const lastLine = model.getLineCount();
    const lastColumn =
      model.getLineLength(lastLine) + 1;

    editor.setPosition({
      lineNumber: lastLine,
      column: lastColumn
    });

    editor.focus();
  }
}