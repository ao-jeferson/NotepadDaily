import { Document } from "../document/Document.js";

function formatNow() {
  const d = new Date();

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}-${mm} ${hh}-${min}`;
}

export default class TabManager {
  constructor() {
    this.tabs = [];
    this.activeDocument = null;
  }

  /* =========================
     Snapshot para sessão
     ========================= */

getSnapshot() {
  return {
    activeTabId: this.active?.id ?? null,
    tabs: this.tabs.map(t => t.toJSON()),
  };
}


restoreSnapshot(snapshot) {
  // ✅ Fallback total
  const tabs = Array.isArray(snapshot?.tabs) ? snapshot.tabs : [];

  this.tabs = tabs.map(t => Document.fromJSON(t));

  const activeId = snapshot?.activeTabId ?? null;

  this.active =
    this.tabs.find(t => t.id === activeId) ??
    this.tabs[0] ??
    null;
}

  createNew(displayName = "") {
    displayName = formatNow();
    const doc = new Document({
      id: crypto.randomUUID(),
      displayName,
    });

    this.tabs.push(doc);
    this.setActive(doc);
    return doc;
  }

  open(doc) {
    this.tabs.push(doc);
    this.setActive(doc);
  }

  getActive() {
    return this.activeDocument;
  }

  setActive(doc) {
    this.activeDocument = doc;
  }

  switchTo(id) {
    const doc = this.tabs.find((d) => d.id === id);
    if (doc) this.setActive(doc);
  }

  close(id) {
    const idx = this.tabs.findIndex((d) => d.id === id);
    if (idx === -1) return;

    const wasActive = this.tabs[idx] === this.activeDocument;
    this.tabs.splice(idx, 1);

    if (wasActive) {
      this.activeDocument = this.tabs[idx - 1] || this.tabs[0] || null;
    }
  }

  move(draggedId, targetId) {
    const from = this.tabs.findIndex((d) => d.id === draggedId);
    const to = this.tabs.findIndex((d) => d.id === targetId);
    if (from === -1 || to === -1) return;

    const [doc] = this.tabs.splice(from, 1);
    this.tabs.splice(to, 0, doc);
  }
}
