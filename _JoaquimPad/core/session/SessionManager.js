const SESSION_KEY = "editor.session.v1";

export default class SessionManager {

  /* =====================================================
     SAVE SESSION
  ===================================================== */

  saveSnapshot(snapshot) {

    const data = {

      version: 1,

      tabs:
        snapshot.tabs ?? [],

      activeTabId:
        snapshot.activeTabId ?? null,

      cursorHistory:
        snapshot.cursorHistory ?? null,

      openedFolder:
        snapshot.openedFolder ?? null

    };

    try {

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(data)
      );

    } catch (err) {

      console.error(
        "Erro ao salvar sessão:",
        err
      );

    }

  }

  /* =====================================================
     LOAD SESSION
  ===================================================== */

 loadSnapshot() {

  const raw =
     localStorage.getItem(SESSION_KEY);

  if (!raw)
    return null;

  try {

    const data = JSON.parse(raw);

    return {

      version: data.version ?? 1,
      tabs: data.tabs ?? [],
      activeTabId: data.activeTabId ?? null,
      cursorHistory:
        data.cursorHistory ?? null,
      openedFolder:
        data.openedFolder ?? null,
      sidebarWidth:
        data.sidebarWidth ?? 260

    };

  } catch {

    return null;

  }

}

  /* =====================================================
     CLEAR SESSION
  ===================================================== */

  clear() {

    localStorage.removeItem(
      SESSION_KEY
    );

  }

}