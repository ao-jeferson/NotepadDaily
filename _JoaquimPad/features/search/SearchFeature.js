// features/search/SearchFeature.js

import { SearchView } from "./SearchView.js";
import { SearchController } from "./SearchController.js";

export class SearchFeature {

    constructor({ fileSystem, tabManager }) {

        this.view = new SearchView();

        this.controller = new SearchController({
            view: this.view,
            fileSystem,
            tabManager
        });

        this.registerShortcut();
    }

    mount(container) {

        container.appendChild(this.view.element);

        this.controller.initialize();
    }

    registerShortcut() {

        window.addEventListener("keydown", e => {

            if (e.ctrlKey && e.shiftKey && e.key === "F") {

                e.preventDefault();

                this.open();
            }
        });
    }

    open() {

        this.view.element.style.display = "block";

        this.view.input.focus();
    }
}