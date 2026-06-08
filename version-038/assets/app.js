(function () {
  const root = document.documentElement.getAttribute("data-root") || ".";
  const normalizedRoot = root.replace(/\/$/, "");

  function toUrl(path) {
    const clean = String(path || "").replace(/^\.\//, "");
    return normalizedRoot + "/" + clean;
  }

  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, position) {
      slide.classList.toggle("active", position === currentSlide);
    });

    dots.forEach(function (dot, position) {
      dot.classList.toggle("active", position === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
  const searchPanel = document.querySelector("[data-search-panel]");
  const searchResults = document.querySelector("[data-search-results]");
  const searchData = Array.isArray(window.SITE_SEARCH) ? window.SITE_SEARCH : [];

  function resultHtml(item) {
    return [
      '<a class="search-result" href="' + toUrl(item.url) + '">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<span>' + escapeHtml(item.category + ' · ' + item.year) + '</span>',
      '<span>' + escapeHtml(item.line || '') + '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function runSearch(term) {
    const keyword = term.trim().toLowerCase();

    if (!searchPanel || !searchResults) {
      return;
    }

    if (!keyword) {
      searchPanel.classList.remove("open");
      searchResults.innerHTML = "";
      return;
    }

    const matches = searchData.filter(function (item) {
      return [item.title, item.category, item.year, item.line, item.tags].join(" ").toLowerCase().includes(keyword);
    }).slice(0, 16);

    searchResults.innerHTML = matches.length
      ? matches.map(resultHtml).join("")
      : '<div class="search-result"><strong>没有找到相关内容</strong><span>换一个关键词继续搜索</span></div>';
    searchPanel.classList.add("open");
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      runSearch(input.value);
    });
  });

  const filterArea = document.querySelector("[data-filter-area]");

  if (filterArea) {
    const queryInput = filterArea.querySelector("[data-filter-query]");
    const yearSelect = filterArea.querySelector("[data-filter-year]");
    const regionSelect = filterArea.querySelector("[data-filter-region]");
    const typeSelect = filterArea.querySelector("[data-filter-type]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const empty = document.querySelector("[data-empty]");

    function applyFilters() {
      const query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const cardTitle = (card.getAttribute("data-title") || "").toLowerCase();
        const cardYear = card.getAttribute("data-year") || "";
        const cardRegion = card.getAttribute("data-region") || "";
        const cardType = card.getAttribute("data-type") || "";
        const matched = (!query || cardTitle.includes(query)) && (!year || cardYear === year) && (!region || cardRegion === region) && (!type || cardType === type);

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [queryInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }
})();
