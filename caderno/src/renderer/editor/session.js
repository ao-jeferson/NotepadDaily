define(
  ["editor/state", "editor/tabs"],
  function (state, tabsApi) {

    function collectSession() {
      return {
        activeIndex: state.tabs.indexOf(state.activeTab),
        wordWrap: state.wordWrapEnabled,
        tabs: state.tabs.map(t => ({
          name: t.name,
          content: t.model.getValue()
        }))
      };
    }

    async function restoreSession() {
      const s = await window.sessionAPI.load();
      if (!s || !Array.isArray(s.tabs)) return false;

      state.tabs.length = 0;
      state.activeTab = null;

      s.tabs.forEach(t => {
        tabsApi.createTabInternal(t.name, t.content);
      });

      if (state.tabs[s.activeIndex]) {
        tabsApi.activateTab(state.tabs[s.activeIndex]);
      } else if (state.tabs.length) {
        tabsApi.activateTab(state.tabs[0]);
      }

      return true;
    }

    return { collectSession, restoreSession };
  }
);