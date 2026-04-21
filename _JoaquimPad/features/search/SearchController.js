export class SearchController {

    constructor({
        view,
        fileSystem,
        tabManager
    }) {

        this.view = view;
        this.fileSystem = fileSystem;
        this.tabManager = tabManager;
    }

    initialize() {

        this.view.onSearch(async query => {

            const matches =
                await this.search(query);

            this.view.renderResults(matches);
        });

        this.view.onResultClick(
            (file, line) => {

                this.openResult(file, line);
            }
        );
    }

    async search(query) {

        const files =
            await this.fileSystem.getAllFiles();

        const matches = [];

        for (const file of files) {

            const content =
                await this.fileSystem.readFile(file);

            const lines =
                content.split("\n");

            lines.forEach((lineText, index) => {

                if (lineText.includes(query)) {

                    matches.push({
                        file,
                        line: index + 1
                    });
                }
            });
        }

        return matches;
    }

    async openResult(file, line) {

        const content =
            await this.fileSystem.readFile(file);

        const editor =
            this.tabManager.openFile(file, content);

        editor.revealLineInCenter(line);
    }
}