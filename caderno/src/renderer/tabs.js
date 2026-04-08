export class TabManager {
  constructor(editor, monaco) {
    this.editor = editor;
    this.monaco = monaco;
    this.tabs = [];
    this.activeTab = null;
    this.tabsDiv = document.getElementById("tabs");
  }

  createTab(name = "Untitled", content = "", language = "plaintext") {
    if (!name) {
      name = getDateTimeTabName();
    }

    const model = this.monaco.editor.createModel(content, language);

    const tab = {
      id: crypto.randomUUID(),
      name,
      model,
    };

    this.tabs.push(tab);
    this.renderTabs();
    this.activateTab(tab.id);
  }

  activateTab(id) {
    const tab = this.tabs.find((t) => t.id === id);
    if (!tab) return;

    this.activeTab = tab;
    this.editor.setModel(tab.model);
    this.renderTabs();
  }

  closeTab(id) {
    const index = this.tabs.findIndex((t) => t.id === id);
    if (index < 0) return;

    this.tabs[index].model.dispose();
    this.tabs.splice(index, 1);

    if (this.activeTab?.id === id) {
      const next = this.tabs[index] || this.tabs[index - 1];
      if (next) {
        this.activateTab(next.id);
      } else {
        this.editor.setModel(null);
      }
    }

    this.renderTabs();
  }

  renderTabs() {
    this.tabsDiv.innerHTML = "";

    this.tabs.forEach((tab) => {
      const div = document.createElement("div");
      div.className = "tab" + (this.activeTab?.id === tab.id ? " active" : "");
      div.textContent = tab.name;

      const close = document.createElement("span");
      close.textContent = "×";
      close.onclick = (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      };

      div.appendChild(close);
      div.onclick = () => this.activateTab(tab.id);

      this.tabsDiv.appendChild(div);
    });
  }

}
