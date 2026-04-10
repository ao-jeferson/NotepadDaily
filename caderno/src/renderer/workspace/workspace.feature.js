(function () {
  /* ======================================================
     DOM / STATE
  ====================================================== */

  const sidebar = document.getElementById("sidebar");
  const treeEl = document.getElementById("workspace-tree");
  const toggleBtn = document.getElementById("btn-toggle-workspace");

  if (!sidebar || !treeEl) {
    console.warn("Workspace DOM não encontrado");
    return;
  }

  let visible = true;

  /* ======================================================
     VISIBILITY
  ====================================================== */

  function notifyResize() {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
  }

  function show() {
    sidebar.style.display = "block";
    visible = true;
    notifyResize();
  }

  function hide() {
    sidebar.style.display = "none";
    visible = false;
    notifyResize();
  }

  function toggle() {
    visible ? hide() : show();
  }

  toggleBtn?.addEventListener("click", toggle);

  /* ======================================================
     TREE RENDER
  ====================================================== */

  function renderTree(nodes, container) {
    container.innerHTML = "";

    nodes.forEach((node) => {
      const el = document.createElement("div");
      el.classList.add("ws-node");

      /* ---------- FOLDER ---------- */
      if (node.type === "folder") {
        el.classList.add("ws-folder");
        el.textContent = node.name;

        const children = document.createElement("div");
        children.className = "ws-children";

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          el.classList.toggle("open");
        });

        renderTree(node.children || [], children);
        el.appendChild(children);
      }

      /* ---------- FILE ---------- */
      if (node.type === "file") {
        el.classList.add("ws-file");
        el.textContent = node.name;
        el.title = node.path;

        // ✅ ABRIR APENAS COM DOUBLE CLICK
        // ✅ MANTER TREEVIEW ABERTO
        el.addEventListener("dblclick", async (e) => {
          e.stopPropagation();

          // 1️⃣ já existe aba → focar
          const existing = appState.tabs.findByPath(node.path);
          if (existing) {
            window.editorApi?.activateTab(existing);
            return; // ✅ NÃO fecha o workspace
          }

          // 2️⃣ abrir nova aba
          const result = await window.api.openFileByPath(node.path);
          if (!result) return;

          window.editorApi?.openTab({
            name: result.path.split(/[\\/]/).pop(),
            content: result.content,
            path: result.path,
          });

          // ✅ NÃO fecha o workspace
        });
      }

      container.appendChild(el);
    });
  }

  /* ======================================================
     OPEN WORKSPACE
  ====================================================== */

  async function open() {
    const data = await window.api.openWorkspace();
    if (!data || !Array.isArray(data.tree)) return;

    renderTree(data.tree, treeEl);
    show();
  }

  /* ======================================================
     PUBLIC API
  ====================================================== */

  window.workspace = {
    open,
    toggle,
    show,
    hide,
  };
})();