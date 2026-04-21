export class SearchView {

    constructor() {

        this.element = document.createElement("div");

        this.element.className = "search-panel";

        this.input = document.createElement("input");

        this.input.placeholder = "Search in files...";

        this.results = document.createElement("div");

        this.results.className = "search-results";

        this.element.appendChild(this.input);
        this.element.appendChild(this.results);
    }

    onSearch(callback) {

        this.input.addEventListener("keydown", e => {

            if (e.key === "Enter") {

                callback(this.input.value);
            }
        });
    }

    renderResults(matches) {

        this.results.innerHTML = "";

        matches.forEach(match => {

            const div = document.createElement("div");

            div.className = "search-item";

            div.textContent =
                `${match.file}:${match.line}`;

            div.dataset.path = match.file;
            div.dataset.line = match.line;

            this.results.appendChild(div);
        });
    }

    onResultClick(callback) {

        this.results.addEventListener("click", e => {

            const item = e.target.closest(".search-item");

            if (item) {

                callback(
                    item.dataset.path,
                    parseInt(item.dataset.line)
                );
            }
        });
    }
}