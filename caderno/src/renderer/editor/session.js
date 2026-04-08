define(["editor/state", "editor/tabs"], function (state, tabsApi) {

  function collectSession() {
    return {
      activeIndex: state.tabs.indexOf(state.activeTab),
      tabs: state.tabs.map(t => ({
        name: t.name,
        content: t.model.getValue(),
      })),
    };
  }

  async function restoreSession() {
    const session = await window.sessionAPI.load();
    if (!session || !Array.isArray(session.tabs)) return false;

    state.tabs.length = 0;
    state.activeTab = null;

    session.tabs.forEach(t =>
      tabsApi.createTabInternal(t.name, t.content)
    );

    if (state.tabs[session.activeIndex]) {
      tabsApi.activateTab(state.tabs[session.activeIndex]);
    } else if (state.tabs.length) {
      tabsApi.activateTab(state.tabs[0]);
    }

    return true;
  }

  return { collectSession, restoreSession };
});