import { Document } from "../document/Document.js";

export default class TabManager {
  constructor() {
    this.tabs = [];
    this.activeDocument = null;
  }

  createNew() {
    const doc = new Document({
      id: crypto.randomUUID()
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
    const doc = this.tabs.find(d => d.id === id);
    if (doc) this.setActive(doc);
  }

  close(id) {
    const idx = this.tabs.findIndex(d => d.id === id);
    if (idx === -1) return;

    const wasActive = this.tabs[idx] === this.activeDocument;
    this.tabs.splice(idx, 1);

    if (wasActive) {
      this.activeDocument =
        this.tabs[idx - 1] || this.tabs[0] || null;
    }
  }

  move(draggedId, targetId) {
    const from = this.tabs.findIndex(d => d.id === draggedId);
    const to = this.tabs.findIndex(d => d.id === targetId);
    if (from === -1 || to === -1) return;

    const [doc] = this.tabs.splice(from, 1);
    this.tabs.splice(to, 0, doc);
  }
}