(function () {
    const root = document.documentElement;
    const basePath = root.dataset.base || "./";
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            const opened = mobilePanel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", opened);
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        const startTimer = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    const connectSearch = function (scope) {
        const input = scope.querySelector("[data-search-input]");
        const results = scope.querySelector("[data-search-results]");
        if (!input || !results || !Array.isArray(window.SEARCH_MOVIES)) {
            return;
        }

        const buildHref = function (url) {
            return basePath + url;
        };

        const buildCover = function (cover) {
            return basePath + cover;
        };

        const render = function (items) {
            results.innerHTML = items.map(function (item) {
                return '<a class="search-result-item" href="' + buildHref(item.url) + '">' +
                    '<img class="search-result-poster" src="' + buildCover(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                    '<span>' +
                        '<span class="search-result-title">' + item.title + '</span>' +
                        '<span class="search-result-meta">' + item.year + ' · ' + item.region + ' · ' + item.category + '</span>' +
                    '</span>' +
                '</a>';
            }).join("");
            results.classList.toggle("is-open", items.length > 0);
        };

        input.addEventListener("input", function () {
            const keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                results.classList.remove("is-open");
                results.innerHTML = "";
                return;
            }
            const matched = window.SEARCH_MOVIES.filter(function (item) {
                return item.search.indexOf(keyword) !== -1;
            }).slice(0, 10);
            render(matched);
        });

        input.addEventListener("focus", function () {
            if (results.innerHTML.trim()) {
                results.classList.add("is-open");
            }
        });

        document.addEventListener("click", function (event) {
            if (!scope.contains(event.target)) {
                results.classList.remove("is-open");
            }
        });
    };

    document.querySelectorAll("[data-search]").forEach(connectSearch);

    document.querySelectorAll("[data-filter-group]").forEach(function (group) {
        const buttons = Array.from(group.querySelectorAll("[data-filter-value]"));
        const gridSelector = group.dataset.filterGroup;
        const grid = document.querySelector(gridSelector);
        if (!grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll("[data-card]"));
        const empty = document.querySelector("[data-empty-state]");

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                const value = button.dataset.filterValue;
                let visible = 0;

                cards.forEach(function (card) {
                    const haystack = [
                        card.dataset.type || "",
                        card.dataset.year || "",
                        card.dataset.region || "",
                        card.dataset.genre || "",
                        card.dataset.category || ""
                    ].join(" ");
                    const matched = value === "all" || haystack.indexOf(value) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            });
        });
    });
}());
