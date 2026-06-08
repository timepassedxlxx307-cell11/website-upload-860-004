(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = $('.nav-toggle');
    var mobileNav = $('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = $('[data-hero-slider]');

    if (hero) {
        var slides = $all('.hero-slide', hero);
        var dots = $all('.hero-dot', hero);
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide') || 0));
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var scope = $('[data-filter-scope]');
        if (!scope) {
            return;
        }
        var cards = $all('.movie-card', scope);
        var searchInput = $('.movie-search-input');
        var yearFilter = $('.movie-year-filter');
        var typeFilter = $('.movie-type-filter');
        var empty = $('.empty-state');
        var query = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var type = normalize(typeFilter && typeFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchedQuery = !query || haystack.indexOf(query) !== -1;
            var matchedYear = !year || normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
            var matchedType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
            var matched = matchedQuery && matchedYear && matchedType;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    var queryParams = new URLSearchParams(window.location.search);
    var q = queryParams.get('q');
    var searchInput = $('.movie-search-input');

    if (q && searchInput) {
        searchInput.value = q;
    }

    ['input', 'change'].forEach(function (eventName) {
        $all('.movie-search-input, .movie-year-filter, .movie-type-filter').forEach(function (control) {
            control.addEventListener(eventName, applyFilters);
        });
    });

    applyFilters();
})();
