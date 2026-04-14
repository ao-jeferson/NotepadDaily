import { Document } from "../document/Document.js";
export default class SessionManager {
  save(tabs) {
    const serialized = tabs.map((doc) => doc.toJSON());
    localStorage.setItem("session", JSON.stringify(serialized));
  }

  load() {
    const raw = localStorage.getItem("session");
    if (!raw) return [];

    try {
      const data = JSON.parse(raw);
      return data.map((d) => Document.fromJSON(d));
    } catch {
      return [];
    }
  }

  saveCursorHistory(history) {
    localStorage.setItem("cursorHistory", JSON.stringify(history));
  }

  loadCursorHistory() {
    const raw = localStorage.getItem("cursorHistory");
    return raw ? JSON.parse(raw) : [];
  }
}
