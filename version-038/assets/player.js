(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    const existing = document.querySelector("script[data-hls-loader]");

    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "1");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function playVideo(video) {
    const stream = video.getAttribute("data-stream");

    if (!stream) {
      return;
    }

    const start = function () {
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    };

    if (video.getAttribute("data-ready") === "1") {
      start();
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.setAttribute("data-ready", "1");
      start();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }

        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        video._hlsInstance = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.setAttribute("data-ready", "1");
        hls.on(window.Hls.Events.MANIFEST_PARSED, start);
      } else {
        video.src = stream;
        video.setAttribute("data-ready", "1");
        start();
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(function (box) {
    const video = box.querySelector("video");
    const button = box.querySelector("[data-play-button]");

    if (!video) {
      return;
    }

    function activate() {
      if (button) {
        button.classList.add("hidden");
      }
      playVideo(video);
    }

    if (button) {
      button.addEventListener("click", activate);
    }

    video.addEventListener("click", activate);
  });
})();
