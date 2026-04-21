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

    const label =
      document.createElement("span");

    label.textContent =
      node.name;

    label.dataset.path =
      node.path;

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

  onFileClick(callback) {

    this.tree.addEventListener(
      "click",
      e => {

        if (
          e.target.tagName === "SPAN"
        ) {

          callback(
            e.target.dataset.path
          );

        }

      }
    );

  }

}