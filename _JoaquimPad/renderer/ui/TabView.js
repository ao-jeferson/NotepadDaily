const languageIcons = {
  javascript: "js",
  typescript: "ts",
  python: "python",
  csharp: "csharp",
  java: "java",
  sql: "sql",
  json: "json",
  yaml: "yaml",
  html: "html",
  css: "css",
  c: "c",
  cpp: "cpp",
  go: "go",
  rust: "rust",
  php: "php",
  shell: "shell",
  markdown: "markdown",
  plaintext: null,
};

export class TabView {
  constructor({ tabContainer, tabManager, cursorNav, activateDocument, saveSession }) {
    this.tabContainer = tabContainer;
    this.tabManager = tabManager;
    this.cursorNav = cursorNav;
    this.activateDocument = activateDocument;
    this.saveSession = saveSession;
    this.sortable = null;
  }

  renderTabs() {
    this.tabContainer.innerHTML = "";

    const pinnedTabs = this.tabManager.tabs.filter((t) => t.pinned);
    const normalTabs = this.tabManager.tabs.filter((t) => !t.pinned);
    const orderedTabs = [...pinnedTabs, ...normalTabs];

    orderedTabs.forEach((doc) => {
      const tab = document.createElement("div");
      tab.className = "tab";

      if (doc === this.tabManager.getActive()) {
        tab.classList.add("active");
      }

      if (doc.pinned) {
        tab.classList.add("pinned");
      }

      const btn = document.createElement("button");
      btn.type = "button";

      const iconKey = languageIcons[doc.language];
      if (iconKey) {
        const icon = document.createElement("img");
        icon.src = `../assets/icons/${iconKey}.png`;
        icon.className = "tab-icon";
        icon.alt = doc.language;
        btn.appendChild(icon);
      }

      const title = document.createElement("span");
      title.className = "tab-title";
      title.textContent = doc.getFileName();
      btn.appendChild(title);

      if (doc.isDirty()) {
        const dirtyDot = document.createElement("span");
        dirtyDot.className = "modified-dot";
        btn.appendChild(dirtyDot);
      }

      btn.onclick = () => {
        this.activateDocument(doc);
      };

      btn.onmousedown = (e) => {
        if (e.button === 1 && !doc.pinned) {
          e.preventDefault();
          this.tabManager.close(doc.id);
          this.cursorNav.onTabClosed(doc.id);
          this.activateDocument(this.tabManager.getActive());
          this.saveSession();
        }
      };

      tab.appendChild(btn);

      if (!doc.pinned) {
        const close = document.createElement("span");
        close.className = "close";
        close.textContent = "×";

        close.onclick = (e) => {
          e.stopPropagation();
          this.tabManager.close(doc.id);
          this.cursorNav.onTabClosed(doc.id);
          this.activateDocument(this.tabManager.getActive());
          this.saveSession();
        };

        tab.appendChild(close);
      }

      tab.oncontextmenu = (e) => {
        e.preventDefault();
        this.showContextMenu(e.clientX, e.clientY, doc);
      };

      this.tabContainer.appendChild(tab);
    });

    this.setupSortable();
  }

  setupSortable() {
    if (!window.Sortable) return;
    if (this.sortable) this.sortable.destroy();

    this.sortable = Sortable.create(this.tabContainer, {
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      filter: ".pinned",
      preventOnFilter: false,

      onEnd: ({ oldIndex, newIndex }) => {
        const allTabs = this.tabManager.tabs.filter(Boolean);
        const pinned = allTabs.filter((t) => t.pinned);
        const normal = allTabs.filter((t) => !t.pinned);
        const pinnedCount = pinned.length;

        let from = oldIndex - pinnedCount;
        let to = newIndex - pinnedCount;

        if (from < 0) from = 0;
        if (to < 0) to = 0;

        if (from >= normal.length || to > normal.length) {
          this.renderTabs();
          return;
        }

        const moved = normal[from];
        if (!moved) {
          this.renderTabs();
          return;
        }

        const newNormal = normal.toSpliced(from, 1).toSpliced(to, 0, moved);

        this.tabManager.tabs = [...pinned, ...newNormal];

        this.renderTabs();
        this.saveSession();
      },
    });
  }

  showContextMenu(x, y, doc) {
    document.querySelector(".tab-context-menu")?.remove();

    const menu = document.createElement("div");
    menu.className = "tab-context-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.innerHTML = `
      <div class="item">${doc.pinned ? "Unpin Tab" : "Pin Tab"}</div>
      ${doc.pinned ? "" : "<div class='item'>Fechar</div>"}
      <div class="item">Fechar outras</div>
    `;

    let i = 0;

    menu.children[i++].onclick = () => {
      doc.pinned = !doc.pinned;

      this.tabManager.tabs = [
        ...this.tabManager.tabs.filter((t) => t.pinned),
        ...this.tabManager.tabs.filter((t) => !t.pinned),
      ];

      this.renderTabs();
      this.saveSession();
      menu.remove();
    };

    if (!doc.pinned) {
      menu.children[i++].onclick = () => {
        this.tabManager.close(doc.id);
        this.cursorNav.onTabClosed(doc.id);
        this.activateDocument(this.tabManager.getActive());
        this.saveSession();
        menu.remove();
      };
    }

    menu.children[i].onclick = () => {
      this.tabManager.tabs
        .filter((t) => t.id !== doc.id && !t.pinned)
        .forEach((t) => this.tabManager.close(t.id));

      this.activateDocument(this.tabManager.getActive());
      this.saveSession();
      menu.remove();
    };

    document.body.appendChild(menu);
    setTimeout(
      () =>
        document.addEventListener("click", () => menu.remove(), {
          once: true,
        }),
      0,
    );
  }
}
