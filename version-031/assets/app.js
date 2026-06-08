(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const startTimer = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(current + 1), 5000);
    };

    if (previous) {
      previous.addEventListener('click', () => {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  document.querySelectorAll('[data-filter-area]').forEach((area) => {
    const input = area.querySelector('[data-filter-keyword]');
    const typeSelect = area.querySelector('[data-filter-type]');
    const regionSelect = area.querySelector('[data-filter-region]');
    const yearSelect = area.querySelector('[data-filter-year]');
    const section = area.closest('section') || document;
    const cards = Array.from(section.querySelectorAll('[data-search-card]'));
    const emptyState = section.querySelector('[data-empty-state]');

    const applyFilter = () => {
      const keyword = normalize(input ? input.value : '');
      const selectedType = normalize(typeSelect ? typeSelect.value : '');
      const selectedRegion = normalize(regionSelect ? regionSelect.value : '');
      const selectedYear = normalize(yearSelect ? yearSelect.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const text = normalize(card.dataset.title);
        const type = normalize(card.dataset.type);
        const region = normalize(card.dataset.region);
        const year = normalize(card.dataset.year);
        const matched = (!keyword || text.includes(keyword)) && (!selectedType || type === selectedType) && (!selectedRegion || region === selectedRegion) && (!selectedYear || year === selectedYear);

        card.classList.toggle('is-filter-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, typeSelect, regionSelect, yearSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    applyFilter();
  });

  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const cover = player.querySelector('[data-play-button]');

    if (!video || !cover) {
      return;
    }

    const source = video.dataset.video;
    let loaded = false;
    let hls = null;

    const playVideo = () => {
      const request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(() => {});
      }
    };

    const loadNative = () => {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    };

    const loadWithHls = () => {
      hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
    };

    const start = () => {
      cover.classList.add('is-hidden');
      video.controls = true;

      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        loadNative();
        return;
      }

      if (window.Hls && Hls.isSupported()) {
        loadWithHls();
        return;
      }

      loadNative();
    };

    cover.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
