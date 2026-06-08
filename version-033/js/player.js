function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !button || !config.source) {
        return;
    }

    function attachSource() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(config.source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = config.source;
        }
    }

    function playNow() {
        attachSource();
        button.classList.add('is-hidden');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', playNow);
    video.addEventListener('click', function () {
        if (!ready) {
            playNow();
        }
    });
    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
