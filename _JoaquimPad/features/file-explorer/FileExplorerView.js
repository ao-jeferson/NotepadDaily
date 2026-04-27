// features/file-explorer/FileExplorerView.js

export class FileExplorerView {

  constructor() {

    this.element =
      document.createElement("div");

    this.element.className =
      "file-explorer";

    this.tree =
      document.createElement("ul");

    this.tree.className =
      "file-tree";

    this.element.appendChild(
      this.tree
    );

    this.fileClickCallback = null;
    this.folderToggleCallback = null;
    this.selectedPath = null;

    this.tree.addEventListener("click", (e) => {
      if (e.target.tagName !== "SPAN") return;

      const type = e.target.dataset.type;
      const path = e.target.dataset.path;
      const nodeElement = e.target.closest("li");

      if (type === "folder") {
        nodeElement.classList.toggle("collapsed");
        this.folderToggleCallback?.(path, nodeElement.classList.contains("collapsed"));
        return;
      }

      if (type === "file") {
        this.selectFile(path);
        this.fileClickCallback?.(path);
      }
    });

  }

  renderTree(nodes) {

    this.tree.innerHTML = "";

    nodes.forEach(node => {

      const li =
        this.createNode(node);

      this.tree.appendChild(li);

    });

  }

  createNode(node) {

    const li =
      document.createElement("li");

    li.className =
      node.type;

    if (this.selectedPath === node.path) {
      li.classList.add("selected");
    }

    const label =
      document.createElement("span");

    label.textContent =
      node.name;

    label.dataset.path =
      node.path;
    label.dataset.type = node.type;

    li.appendChild(label);

    if (node.children) {

      const ul =
        document.createElement("ul");

      node.children.forEach(child => {

        ul.appendChild(
          this.createNode(child)
        );

      });

      li.appendChild(ul);

    }

    return li;

  }

  selectFile(path) {
    // Remove previous selection
    const prevSelected = this.tree.querySelector(".selected");
    if (prevSelected) {
      prevSelected.classList.remove("selected");
    }

    // Add new selection
    const newSelected = this.tree.querySelector(`[data-path="${path}"]`);
    if (newSelected) {
      newSelected.closest("li").classList.add("selected");
    }

    this.selectedPath = path;
  }

  onFileClick(callback) {
    this.fileClickCallback = callback;

  }

  onFolderToggle(callback) {
    this.folderToggleCallback = callback;
  }

}