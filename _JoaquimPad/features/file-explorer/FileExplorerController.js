// features/file-explorer/FileExplorerController.js

export class FileExplorerController {

  constructor({
    view,
    fileSystem,
    tabManager
  }) {

    this.view = view;

    this.fileSystem = fileSystem;

    this.tabManager = tabManager;

  }

  async initialize(folderPath = null) {

    try {

      const root = folderPath ||
        await this.fileSystem
          .getWorkspaceRoot();

      if (!root) {

        console.warn(
          "Nenhuma pasta selecionada"
        );

        return;

      }

      this.currentFolder = root;

      const tree =
        await this.fileSystem
          .readDirectoryTree(root);

      this.view.renderTree(tree);

      this.view.onFileClick(
        path => this.openFile(path)
      );

    }
    catch (err) {

      console.error(
        "Erro ao inicializar Explorer:",
        err
      );

    }

  }

  async openFile(path) {

    try {

      const isFile =
        await this.fileSystem
          .isFile(path);

      if (!isFile) return;

      const content =
        await window.fs.readFile(path);

      this.tabManager.open({

        filePath: path,
        content

      });

      // Highlight the selected file
      this.view.selectFile(path);

    }
    catch (err) {

      console.error(
        "Erro ao abrir arquivo:",
        err
      );

    }

  }

}