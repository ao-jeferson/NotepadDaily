// features/file-explorer/FileExplorerFeature.js

import { FileExplorerView } from "./FileExplorerView.js";
import { FileExplorerController } from "./FileExplorerController.js";

export class FileExplorerFeature {

  constructor({ fileSystem, tabManager }) {

    this.view = new FileExplorerView();

    this.controller =
      new FileExplorerController({

        view: this.view,
        fileSystem,
        tabManager

      });

  }

  mount(container) {

    if (!container) {

      console.error(
        "Sidebar container não encontrado"
      );

      return;

    }

    container.appendChild(
      this.view.element
    );

    this.controller.initialize();

  }

}