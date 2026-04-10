console.log("✅ workspace.feature.js carregado");
(function () {
  const treeEl = document.getElementById("workspace-tree");

  function renderTree(nodes, container) {
    container.innerHTML += "<div>📁 WORKSPACE</div>";

    nodes.forEach((node) => {
      const el = document.createElement("div");
      el.style.paddingLeft = "12px";
      el.style.cursor = "pointer";

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

      if (node.type === "file") {
        el.textContent = "📄 " + node.name;
        container.appendChild(el);
      }
    });
  }

  window.openWorkspace = async function () {
    console.log("📂 openWorkspace chamado");

    const data = await window.api.openWorkspace();
    console.log("📁 dados do workspace:", data);

    if (!data || !Array.isArray(data.tree)) {
      console.error("❌ tree inválida", data);
      return;
    }

    const treeEl = document.getElementById("workspace-tree");
    if (!treeEl) {
      console.error("❌ #workspace-tree não encontrado no DOM");
      return;
    }

    treeEl.innerHTML = "";
    renderTree(data.tree, treeEl);
  };

  // ✅ expõe a função para o renderer principal
  window.openWorkspace = openWorkspace;
})();
