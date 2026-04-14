import { Document } from "../document/Document.js";

/* =========================
 * Linguagem por extensão
 * ========================= */
function detectLanguage(fileName) {
  if (fileName.endsWith(".js")) return "javascript";
  if (fileName.endsWith(".ts")) return "typescript";
  if (fileName.endsWith(".py")) return "python";
  if (fileName.endsWith(".html")) return "html";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith(".json")) return "json";
  if (fileName.endsWith(".md")) return "markdown";
  if (fileName.endsWith(".java")) return "java";
  if (fileName.endsWith(".c")) return "c";
  if (fileName.endsWith(".cpp")) return "cpp";
  if (fileName.endsWith(".cs")) return "csharp";
  if (fileName.endsWith(".go")) return "go";
  if (fileName.endsWith(".rs")) return "rust";
  if (fileName.endsWith(".php")) return "php";
  if (fileName.endsWith(".sql")) return "sql";
  if (fileName.endsWith(".yml") || fileName.endsWith(".yaml"))
    return "yaml";
  return "plaintext";
}

export class FileSystemService {
  async open() {
    const path = await window.fs.openDialog();
    if (!path) return null;

    const content = await window.fs.readFile(path);
    const fileName = path.split(/[\\/]/).pop();
    const language = detectLanguage(fileName);

    return new Document({
      id: crypto.randomUUID(),
      filePath: path,
      content,
      language
    });
  }

  async save(document) {
    if (!document.filePath) {
      return this.saveAs(document);
    }

    await window.fs.writeFile(
      document.filePath,
      document.getContent()
    );

    document.markClean();
  }

  async saveAs(document) {
    const path = await window.fs.saveDialog();
    if (!path) return;

    document.setFilePath(path);

    const fileName = path.split(/[\\/]/).pop();
    document.setLanguage(detectLanguage(fileName));

    await this.save(document);
  }
}