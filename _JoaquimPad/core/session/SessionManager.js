import { Document } from "../document/Document.js";

export default class SessionManager {
  constructor() {
    this.key = "joaquimpad-session";
  }

  save(documents) {
    const data = documents.map(d => d.toJSON());
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];

    return JSON.parse(raw).map(Document.fromJSON);
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}