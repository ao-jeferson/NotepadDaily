(function () {
  /* ======================================================
     STATE PRIVADO
  ====================================================== */

  const tabs = [];
  let activeTab = null;

  /* ======================================================
     TABS API
  ====================================================== */

  function addTab(tab) {
    tabs.push(tab);
    activeTab = tab;
  }

  function removeTab(tab) {
    const index = tabs.indexOf(tab);
    if (index !== -1) {
      tabs.splice(index, 1);
      if (activeTab === tab) {
        activeTab = tabs[tabs.length - 1] || null;
      }
    }
  }

  function getTabs() {
    return tabs.slice(); // evita mutação externa
  }

  function findTabByPath(path) {
    if (!path) return null;
    return tabs.find((t) => t.path === path) || null;
  }

  function setActiveTab(tab) {
    activeTab = tab;
  }

  function getActiveTab() {
    return activeTab;
  }

  /* ======================================================
     PUBLIC API
  ====================================================== */

  window.appState = {
    tabs: {
      add: addTab,
      remove: removeTab,
      getAll: getTabs,
      findByPath: findTabByPath,
      setActive: setActiveTab,
      getActive: getActiveTab,
    },
  };
})();