(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-search]'));
    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
      });
    });
  }
})();

function setupMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var initialized = false;
  var hlsInstance = null;

  if (!video || !button || !config.url) {
    return;
  }

  function bindSource() {
    if (initialized) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(config.url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = config.url;
    }

    initialized = true;
  }

  function startPlayback() {
    bindSource();
    video.controls = true;
    button.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  button.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!initialized || video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
