const SESSION_KEY = "editor.session.v1";

export default class SessionManager {


saveSnapshot(snapshot) {
  const data = {
    version: 1,
    tabs: snapshot.tabs ?? [],
    activeTabId: snapshot.activeTabId ?? null,
    cursorHistory: snapshot.cursorHistory ?? null,
  };

  localStorage.setItem("editor:session", JSON.stringify(data));
}

loadSnapshot() {
  const raw = localStorage.getItem("editor:session");
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);

    if (!data.tabs || !Array.isArray(data.tabs)) {
      return { tabs: [] }; // ✅ fallback seguro
    }

    return data;
  } catch {
    return { tabs: [] };
  }
}


  clear() {
    localStorage.removeItem(SESSION_KEY);
  }
}