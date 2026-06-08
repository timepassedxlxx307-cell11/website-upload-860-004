(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var button = document.querySelector('.mobile-toggle');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            var open = document.body.classList.toggle('mobile-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
                start();
            });
        });
        carousel.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        forms.forEach(function (form) {
            var scopeId = form.getAttribute('data-filter-scope');
            var scope = document.getElementById(scopeId);
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var empty = document.querySelector('[data-empty-for="' + scopeId + '"]');
            var params = new URLSearchParams(window.location.search);
            var queryInput = form.querySelector('[name="q"]');
            if (queryInput && params.get('q')) {
                queryInput.value = params.get('q');
            }
            function apply() {
                var query = normalize(form.querySelector('[name="q"]') && form.querySelector('[name="q"]').value);
                var category = normalize(form.querySelector('[name="category"]') && form.querySelector('[name="category"]').value);
                var year = normalize(form.querySelector('[name="year"]') && form.querySelector('[name="year"]').value);
                var type = normalize(form.querySelector('[name="type"]') && form.querySelector('[name="type"]').value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-title'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            form.addEventListener('input', apply);
            form.addEventListener('change', apply);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    window.SitePlayer = {
        init: function (videoId, overlayId, mediaUrl) {
            var video = document.getElementById(videoId);
            var overlay = document.getElementById(overlayId);
            if (!video || !overlay || !mediaUrl) {
                return;
            }
            var attached = false;
            var hlsInstance = null;
            function attachMedia() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = mediaUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(mediaUrl);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = mediaUrl;
            }
            function play() {
                attachMedia();
                overlay.classList.add('is-hidden');
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }
            overlay.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('ended', function () {
                overlay.classList.remove('is-hidden');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
