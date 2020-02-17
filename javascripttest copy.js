// const video = document.getElementById('video');
// const videoControls = document.getElementById('video-controls');

// const videoWorks = !!document.createElement('video').canPlayType;

// const playButton = document.getElementById('play');
// const playbackIcons = document.querySelectorAll('.playback-icons use');
// const timeElapsed = document.getElementById('time-elapsed');
// const duration = document.getElementById('duration');
// const progressBar = document.getElementById('progress-bar');
// const seek = document.getElementById('seek');
// const seekTooltip = document.getElementById('seek-tooltip');
// const volumeButton = document.getElementById('volume-button');
// const volumeIcons = document.querySelectorAll('.volume-button use');
// const volumeMute = document.querySelector('use[href="#volume-mute"]');
// const volumeLow = document.querySelector('use[href="#volume-low"]');
// const volumeHigh = document.querySelector('use[href="#volume-high"]');
// const volume = document.getElementById('volume');

var tv = tv || {};
tv.freewheel = tv.freewheel || {};
tv.freewheel.DemoPlayer = function() {
    var networkId = 96749;
    var serverURL = "http://demo.v.fwmrm.net/ad/g/1";
    var profileId = "96749:kelsey-js-player";
    var videoAssetId = "defaultVideo";
    var siteSectionId = "defaultSite_defaultSection";
    var videoDuration = 500;
    adDataRequested = false;
    currentAdContext = null;

    this.adManager = new tv.freewheel.SDK.adManager();
    this.adManager.setNetwork(networkId);
    this.adManager.setServer(serverURL);

    video = document.getElementById('video');
    videoControls = document.getElementById('video-controls');
    videoWorks = !!document.createElement('video').canPlayType;    
    playButton = document.getElementById('play');
    playbackIcons = document.querySelectorAll('.playback-icons use');
    timeElapsed = document.getElementById('time-elapsed');
    duration = document.getElementById('duration');
    progressBar = document.getElementById('progress-bar');
    seek = document.getElementById('seek');
    seekTooltip = document.getElementById('seek-tooltip');
    volumeButton = document.getElementById('volume-button');
    volumeIcons = document.querySelectorAll('.volume-button use');
    volumeMute = document.querySelector('use[href="#volume-mute"]');
    volumeLow = document.querySelector('use[href="#volume-low"]');
    volumeHigh = document.querySelector('use[href="#volume-high"]');
    volume = document.getElementById('volume');

}

tv.freewheel.DemoPlayer.prototype = {
    if (videoWorks) {
    video.controls = false;
    videoControls.classList.remove('hidden');
    },

    togglePlay: function() {
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
        }
    },

    updatePlayButton: function() {
        playbackIcons.forEach(icon => icon.classList.toggle('hidden'));

        if (video.paused) {
            playButton.setAttribute('data-title', 'Play (k)');
        } else {
            playButton.setAttribute('data-title', 'Pause (k)');
        }
    },

    formatTime: function(timeInSeconds) {
        const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

        return {
            minutes: result.substr(3, 2),
            seconds: result.substr(6, 2),
        };
    },

    initializeVideo: function() {
        const videoDuration = Math.round(video.duration);
        seek.setAttribute('max', videoDuration);
        progressBar.setAttribute('max', videoDuration);
        const time = formatTime(videoDuration);
        duration.innerText = `${time.minutes}:${time.seconds}`;
        duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    },

    updateTimeElapsed: function() {
        const time = formatTime(Math.round(video.currentTime));
        timeElapsed.innerText = `${time.minutes}:${time.seconds}`
        timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    },

    updateProgress: function() {
        seek.value = Math.floor(video.currentTime);
        progressBar.value = Math.floor(video.currentTime);
    },

    updateSeekTooltip: function(event) {
        const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
        seek.setAttribute('data-seek', skipTo)
        const t = formatTime(skipTo);
        seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
        const rect = video.getBoundingClientRect();
        seekTooltip.style.left = `${event.pageX - rect.left}px`;
    },

    skipAhead: function(event) {
        const skipTo = event.target.dataset.seek;
        video.currentTime = skipTo;
        progressBar.value = skipTo;
        seek.value = skipTo;
    },

    updateVolume: function() {
        if (video.muted) {
            video.muted = false;
        }

        video.volume = volume.value;
    },

    updateVolumeIcon: function() {
        volumeIcons.forEach(icon => {
            icon.classList.add('hidden');
        });

        volumeButton.setAttribute('data-title', 'Mute (m)');

        if (video.muted || video.volume === 0) {
            volumeMute.classList.remove('hidden');
            volumeButton.setAttribute('data-title', 'Unmute (m)');
        } else if (video.volume > 0 && video.volume <= 0.5) {
            volumeLow.classList.remove('hidden');
        } else {
            volumeHigh.classList.remove('hidden');
        }

    },

    toggleMute: function() {
        video.muted = !video.muted;

        if (video.muted) {
            volume.setAttribute('data-volume', volume.vaue);
            volume.value = 0;
        } else {
            volume.value = volume.dataset.volume;
        }
    }

    playButton.addEventListener('click', togglePlay);
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);
    video.addEventListener('loadeddata', initializeVideo);
    video.addEventListener('timeupdate', updateTimeElapsed);
    video.addEventListener('timeupdate', updateProgress);
    seek.addEventListener('mousemove', updateSeekTooltip);
    seek.addEventListener('input', skipAhead);
    volume.addEventListener('input', updateVolume);
    video.addEventListener('volumechange', updateVolumeIcon);
    volumeButton.addEventListener('click', toggleMute);
}