export default class SessionManager {
  constructor() {
    this.key = "joaquimpad-session";
  }

  save(tabs) {
    const data = tabs.map(tab => ({
      id: tab.id,
      name: tab.name,
      content: tab.content,
      language: tab.language,
      active: tab.active
    }));
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
