import { Document } from "../document/Document.js";
import { LargeDocument } from "../document/LargeDocument.js";

/* =====================================================
   Linguagem por extensão
   ===================================================== */

function detectLanguage(fileName) {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".js")) return "javascript";
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".c")) return "c";
  if (lower.endsWith(".cpp")) return "cpp";
  if (lower.endsWith(".cs")) return "csharp";
  if (lower.endsWith(".go")) return "go";
  if (lower.endsWith(".rs")) return "rust";
  if (lower.endsWith(".php")) return "php";
  if (lower.endsWith(".sql")) return "sql";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";

  return "plaintext";
}

/* =====================================================
   FileSystemService
   ===================================================== */

const LARGE_FILE_LIMIT = 5 * 1024 * 1024; // 5 MB
const PREVIEW_BYTES = 1024 * 1024; // 1 MB

export class FileSystemService {
  /* =========================
     Abrir arquivo
     ========================= */
  async open() {
    const path = await window.fs.openDialog();
    if (!path) return null;

    const stats = await window.fs.stat(path);
    const fileName = path.split(/[\\/]/).pop();
    const language = detectLanguage(fileName);

    // ✅ Arquivo grande → modo especial
    if (stats.size > LARGE_FILE_LIMIT) {
      const preview = await window.fs.readFirstBytes(
        path,
        PREVIEW_BYTES
      );

      return new LargeDocument({
        id: crypto.randomUUID(),
        filePath: path,
        previewContent: preview,
        language,
        totalLines: 0 // pode ser calculado depois
      });
    }

    // ✅ Arquivo normal
    const content = await window.fs.readFile(path);

    return new Document({
      id: crypto.randomUUID(),
      filePath: path,
      content,
      language
    });
  }

  /* =========================
     Salvar
     ========================= */
  async save(document) {
    if (document.isLargeFile) {
      throw new Error(
        "Arquivos grandes são somente leitura."
      );
    }

    if (!document.filePath) {
      return this.saveAs(document);
    }

    await window.fs.writeFile(
      document.filePath,
      document.getContent()
    );

    document.markClean();
  }

  /* =========================
     Salvar como
     ========================= */
  async saveAs(document) {
    const path = await window.fs.saveDialog();
    if (!path) return;

    document.setFilePath(path);

    const fileName = path.split(/[\\/]/).pop();
    document.setLanguage(detectLanguage(fileName));

    await this.save(document);
  }

  /* =========================
     Streaming futuro (opcional)
     ========================= */
  async readChunk(path, start, size) {
    return window.fs.readChunk(path, start, size);
  }
}