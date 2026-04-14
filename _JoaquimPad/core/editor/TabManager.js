export default class TabManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
  }

  createTab(content = "") {
  const now = new Date();
  const name = this.currentFilePath
    ? this.currentFilePath.split(/[\\/]/).pop()
    : now.toLocaleString("pt-BR");
  const tab = { id: Date.now(), name, content, active: false };
  this.tabs.push(tab);
  this.switchTab(tab.id);
  return tab;
}


  switchTab(id) {
    this.activeTabId = id;
    this.tabs.forEach(t => t.active = (t.id === id));
  }

  getActiveTab() {
    return this.tabs.find(t => t.id === this.activeTabId);
  }
}