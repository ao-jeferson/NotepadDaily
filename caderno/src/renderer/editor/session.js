define(["editor/state", "editor/tabs"], function (state, tabsApi) {

  function collectSession() {
    return {
      activeIndex: state.tabs.indexOf(state.activeTab),
      wordWrap: state.wordWrapEnabled,
      tabs: state.tabs.map(t => ({
        name: t.name,
        path: t.path,
        content: t.model.getValue()
      }))
    };
  }

  async function restoreSession() {
    const s = await window.sessionAPI.load();
    if (!s || !Array.isArray(s.tabs)) return false;

    state.wordWrapEnabled = s.wordWrap ?? true;
    state.tabs.length = 0;
    state.activeTab = null;

    s.tabs.forEach(t => {
      const tab = tabsApi.createTabInternal(t.name, t.content);
      tab.path = t.path || null;
    });

    if (state.tabs[s.activeIndex]) {
      tabsApi.activateTab(state.tabs[s.activeIndex]);
    }

    return true;
  }

  return { collectSession, restoreSession };
});
