(function () {
    function initMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-nav]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(next);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function initFilters() {
        var input = document.querySelector('[data-filter-input]');
        var year = document.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-result]');
        if (!cards.length) {
            return;
        }

        var initial = getQueryValue('q');
        if (input && initial) {
            input.value = initial;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var content = (card.getAttribute('data-filter') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchesQuery = !query || content.indexOf(query) !== -1;
                var matchesYear = !yearValue || cardYear === yearValue;
                var keep = matchesQuery && matchesYear;
                card.hidden = !keep;
                if (keep) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
    });

    window.initPlayer = function (streamUrl) {
        var video = document.querySelector('[data-player]');
        var cover = document.querySelector('[data-player-cover]');
        var trigger = document.querySelector('[data-play-trigger]');
        if (!video || !streamUrl) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            attached = true;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        function showCover() {
            if (cover) {
                cover.classList.remove('is-hidden');
            }
        }

        function playVideo() {
            attachStream();
            hideCover();
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                    showCover();
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', playVideo);
        }
        if (cover && cover !== trigger) {
            cover.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (!attached) {
                playVideo();
            }
        });
        video.addEventListener('play', hideCover);
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
