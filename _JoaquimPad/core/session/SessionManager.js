const SESSION_KEY = "editor.session.v1";

export default class SessionManager {
  saveSnapshot(snapshot) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ version: 1, ...snapshot })
    );
  }

  loadSnapshot() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      if (data.version !== 1) return null;
      return data;
    } catch {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(SESSION_KEY);
  }
}