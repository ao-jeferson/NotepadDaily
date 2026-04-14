export function detectLanguageFromName(fileName) {
  if (!fileName || typeof fileName !== "string") return null;

  const lower = fileName.toLowerCase();

  if (lower.endsWith(".js")) return "javascript";
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".cs")) return "csharp";
  if (lower.endsWith(".py")) return "python";

  return null;
}

export function detectLanguageFromContent(text = "") {
  const sample = text.slice(0, 500);

  if (/^\s*{[\s\S]*}/.test(sample)) return "json";
  if (/^\s*#\s+/m.test(sample)) return "markdown";
  if (/<html|<div|<!doctype html/i.test(sample)) return "html";
  if (/function\s+\w+|\=\>/i.test(sample)) return "javascript";
  if (/using\s+\w+|namespace\s+\w+/i.test(sample)) return "csharp";
  if (/def\s+\w+\(|import\s+\w+/i.test(sample)) return "python";

  return null;
}