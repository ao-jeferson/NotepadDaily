import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";
import TabManager from "../core/editor/TabManager.js";
import SessionManager from "../core/session/SessionManager.js";

window.createEditor = () => {
  const container = document.getElementById("editor");
  const tabContainer = document.getElementById("tabs");
  const newTabBtn = document.getElementById("newTabBtn");

  /* ============================
   * Core initialization
   * ============================ */
  EditorCore.init(container);

  const fsService = new FileSystemService();
  const tabManager = new TabManager();
  const session = new SessionManager();

  const statusBar = new StatusBar(EditorCore);
  statusBar.init();

  /* ============================
   * Helpers
   * ============================ */
  function activateDocument(doc) {
    tabManager.setActive(doc);
    EditorCore.setDocument(doc);
    statusBar.bindDocument(doc);
    renderTabs();
  }

  /* ============================
   * Restore session
   * ============================ */
  const docs = session.load();

  if (docs.length > 0) {
    docs.forEach(d => tabManager.open(d));
    activateDocument(tabManager.getActive());
  } else {
    const doc = tabManager.createNew();
    activateDocument(doc);
  }

  /* ============================
   * New tab button
   * ============================ */
  newTabBtn.addEventListener("click", () => {
    const doc = tabManager.createNew();
    activateDocument(doc);
    session.save(tabManager.tabs);
  });

  /* ============================
   * Menu actions
   * ============================ */

  window.menu.onNewFile(() => {
    const doc = tabManager.createNew();
    activateDocument(doc);
    session.save(tabManager.tabs);
  });

  window.menu.onOpenFile(async () => {
    const doc = await fsService.open();
    if (!doc) return;

    tabManager.open(doc);
    activateDocument(doc);
    session.save(tabManager.tabs);
  });

  window.menu.onSaveFile(() => {
    const doc = tabManager.getActive();
    if (doc) fsService.save(doc);
  });

  window.menu.onSaveAsFile(() => {
    const doc = tabManager.getActive();
    if (doc) fsService.saveAs(doc);
  });

  window.menu.onCloseTab(() => {
    const active = tabManager.getActive();
    if (!active) return;

    tabManager.close(active.id);
    const next = tabManager.getActive();

    if (next) activateDocument(next);
    else EditorCore.setDocument(null);

    session.save(tabManager.tabs);
  });

  window.menu.onSetLanguage(lang => {
    const doc = tabManager.getActive();
    if (!doc) return;

    doc.language = lang;
    EditorCore.setDocument(doc);
    renderTabs();
    session.save(tabManager.tabs);
  });

  /* ============================
   * Render tabs
   * ============================ */
 function renderTabs() {
  tabContainer.innerHTML = "";

  tabManager.tabs.forEach(doc => {
    const el = document.createElement("div");
    el.classList.add("tab");

    const btn = document.createElement("button");
    btn.textContent =
      `${doc.getFileName()}${doc.isDirty() ? "*" : ""}`;

    if (doc === tabManager.getActive()) {
      btn.classList.add("active");
    }

    // ✅ trocar de aba
    btn.onclick = () => activateDocument(doc);

    // ✅ FECHAR ABA COM CLIQUE DA RODA DO MOUSE
    btn.addEventListener("mousedown", e => {
      if (e.button === 1) { // botão do meio
        e.preventDefault();
        tabManager.close(doc.id);

        const next = tabManager.getActive();
        if (next) activateDocument(next);
        session.save(tabManager.tabs);
      }
    });

    // botão X
    const close = document.createElement("span");
    close.textContent = "×";
    close.classList.add("close");
    close.onclick = e => {
      e.stopPropagation();
      tabManager.close(doc.id);

      const next = tabManager.getActive();
      if (next) activateDocument(next);
      session.save(tabManager.tabs);
    };

    el.appendChild(btn);
    el.appendChild(close);
    tabContainer.appendChild(el);
  });

  /* ============================
   * ✅ DRAG & DROP DAS ABAS
   * ============================ */
  if (window.Sortable) {
    Sortable.create(tabContainer, {
      animation: 150,
      onEnd: evt => {
        const [moved] = tabManager.tabs.splice(evt.oldIndex, 1);
        tabManager.tabs.splice(evt.newIndex, 0, moved);
        renderTabs();
      }
    });
  }
}
};