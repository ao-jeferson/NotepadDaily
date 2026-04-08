define(["editor/state"], function (state) {

  function generateTabName() {
    return new Date().toLocaleString();
  }

  function createTabInternal(name, content) {
    const model = monaco.editor.createModel(content || "", "plaintext");
    const tab = { name: name || generateTabName(), model };
    state.tabs.push(tab);
    return tab;
  }

  function createTab(name, content) {
    activateTab(createTabInternal(name, content));
  }

  function activateTab(tab) {
    state.activeTab = tab;
    state.editor.setModel(tab.model);
    renderTabs();
  }

  function closeTab(tab) {
    const i = state.tabs.indexOf(tab);
    if (i === -1) return;

    tab.model.dispose();
    state.tabs.splice(i, 1);

    if (state.tabs.length) {
      activateTab(state.tabs[Math.max(0, i - 1)]);
    } else {
      createTab();
    }
  }

  function renderTabs() {
    const tabsDiv = document.getElementById("tabs");
    tabsDiv.innerHTML = "";

    state.tabs.forEach(tab => {
      const el = document.createElement("div");
      el.className = "tab" + (tab === state.activeTab ? " active" : "");
      el.textContent = tab.name;
      el.onclick = () => activateTab(tab);
      tabsDiv.appendChild(el);
    });
  }

  return {
    createTab,
    createTabInternal,
    activateTab,
    closeTab,
  };
});