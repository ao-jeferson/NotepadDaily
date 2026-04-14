import { Document } from "./Document.js";

/**
 * LargeDocument representa um arquivo grande.
 *
 * - Conteúdo parcial (preview)
 * - Read-only
 * - Preparado para streaming
 * - Compatível com sessões
 */
export class LargeDocument extends Document {
  constructor({
    id,
    filePath,
    previewContent = "",
    language = "plaintext",
    displayName = null,
    totalLines = 0,
    loadedRange = { startLine: 0, endLine: 5000 }
  }) {
    super({
      id,
      filePath,
      content: previewContent,
      language,
      displayName: displayName ?? LargeDocument._extractName(filePath)
    });

    // ===== Flags de comportamento =====
    this.isLargeFile = true;
    this.isVirtual = true;
    this.isReadOnly = true;

    // ===== Estado de carregamento =====
    this.loadedRange = {
      startLine: loadedRange.startLine,
      endLine: loadedRange.endLine
    };

    this.totalLines = totalLines;

    // Documento grande nunca começa "dirty"
    this._dirty = false;
  }

  /* =====================================================
     Overrides de comportamento
     ===================================================== */

  /**
   * Arquivos grandes não podem ser editados diretamente.
   */
  setContent() {
    throw new Error(
      "LargeDocument é somente leitura. Use streaming para edição."
    );
  }

  /**
   * Nunca fica dirty por edição direta.
   */
  isDirty() {
    return false;
  }

  /**
   * Placeholder futuro: expandir o conteúdo carregado.
   */
  updateLoadedRange(newRange) {
    this.loadedRange = {
      startLine: newRange.startLine,
      endLine: newRange.endLine
    };
  }

  /* =====================================================
     Sessão
     ===================================================== */

  /**
   * Serialização para sessão.
   */
  toJSON() {
    return {
      id: this.id,
      filePath: this.filePath,
      language: this.language,
      displayName: this.displayName,

      // LargeDocument específicos
      type: "large",
      isLargeFile: true,
      isVirtual: true,
      isReadOnly: true,

      loadedRange: this.loadedRange,
      totalLines: this.totalLines,

      // preview apenas
      content: this.getContent()
    };
  }

  /**
   * Restauração da sessão.
   */
  static fromJSON(data) {
    return new LargeDocument({
      id: data.id,
      filePath: data.filePath,
      previewContent: data.content ?? "",
      language: data.language,
      displayName: data.displayName,
      totalLines: data.totalLines ?? 0,
      loadedRange: data.loadedRange ?? { startLine: 0, endLine: 5000 }
    });
  }

  /* =====================================================
     Utilitário
     ===================================================== */

  static _extractName(path) {
    if (!path) return "Untitled";
    return path.split(/[\\/]/).pop();
  }
}
