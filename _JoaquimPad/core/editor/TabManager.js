export default class TabManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
  }

  createTab(content = "", name = null) {
    const now = new Date();
    const tabName = name || now.toLocaleString("pt-BR");
    const tab = {
      id: Date.now(),
      name: tabName,
      content,
      active: false
    };
    this.tabs.push(tab);
    this.switchTab(tab.id);
    return tab;
  }

  switchTab(id) {
    this.activeTabId = id;
    this.tabs.forEach(t => (t.active = t.id === id));
  }

  getActiveTab() {
    return this.tabs.find(t => t.id === this.activeTabId);
  }

  closeTab(id) {
    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.activeTabId === id) {
      this.activeTabId = this.tabs.length ? this.tabs[0].id : null;
    }
  }
}
