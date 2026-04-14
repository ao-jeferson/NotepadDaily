export default class TabManager {
  constructor() {
    this.tabs = [];
    this.counter = 0;
  }

  createTab(content = "", name = "Untitled", language = "plaintext") {
    const tab = {
      id: String(this.counter++),
      name,
      content,
      language,
      active: true
    };
    this.tabs.forEach(t => (t.active = false));
    this.tabs.push(tab);
    return tab;
  }

  getActiveTab() {
    return this.tabs.find(t => t.active);
  }

  switchTab(id) {
    this.tabs.forEach(t => (t.active = false));
    const tab = this.tabs.find(t => t.id === id);
    if (tab) tab.active = true;
  }

  closeTab(id) {
    const idx = this.tabs.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.tabs.splice(idx, 1);
      if (this.tabs.length > 0) {
        this.tabs[Math.max(0, idx - 1)].active = true;
      }
    }
  }

  // ✅ novo método para mover abas
  moveTab(draggedId, targetId) {
    const draggedIndex = this.tabs.findIndex(t => t.id === draggedId);
    const targetIndex = this.tabs.findIndex(t => t.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedTab] = this.tabs.splice(draggedIndex, 1);
    this.tabs.splice(targetIndex, 0, draggedTab);
  }
}
