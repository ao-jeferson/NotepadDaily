import { Document } from "../document/Document.js";

export default class SessionManager {
  constructor() {
    this.key = "joaquimpad-session";
    this.cursorKey = "joaquimpad-cursor-history";
  }

  save(documents) {
    console.log("[SESSION] Salvando documentos:", documents.length);
    const data = documents.map(d => d.toJSON());
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return parsed.map(Document.fromJSON);
    } catch (e) {
      console.error("[SESSION] Erro ao carregar sessão", e);
      return [];
    }
  }

  saveCursorHistory(history) {
    localStorage.setItem(
      this.cursorKey,
      JSON.stringify(history)
    );
  }

  loadCursorHistory() {
    const raw = localStorage.getItem(this.cursorKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(this.key);
    localStorage.removeItem(this.cursorKey);
  }
}