const video = document.getElementById('video');
const videoControls = document.getElementById('video-controls');
const contentSrc = video.currentSrc;

const videoWorks = !!document.createElement('video').canPlayType;

const playButton = document.getElementById('play');
const playbackIcons = document.querySelectorAll('.playback-icons use');
const timeElapsed = document.getElementById('time-elapsed');
const duration = document.getElementById('duration');
const progressBar = document.getElementById('progress-bar');
const seek = document.getElementById('seek');
const seekTooltip = document.getElementById('seek-tooltip');
const volumeButton = document.getElementById('volume-button');
const volumeIcons = document.querySelectorAll('.volume-button use');
const volumeMute = document.querySelector('use[href="#volume-mute"]');
const volumeLow = document.querySelector('use[href="#volume-low"]');
const volumeHigh = document.querySelector('use[href="#volume-high"]');
const volume = document.getElementById('volume');

const theNetworkId = 96749;
const theServerURL = "http://demo.v.fwmrm.net/ad/g/1";
const theProfileId = "96749:kelsey-js-player";
const theVideoAssetId = "defaultVideo";
const theSiteSectionId = "defaultSite_defaultSection";
const theVideoDuration = 500;
const adDataRequested = false;

const adManager = new tv.freewheel.SDK.AdManager();
adManager.setNetwork(theNetworkId);
adManager.setServer(theServerURL);
const currentPlayingSlotType = null;

const currentAdContext = adManager.newContext();
currentAdContext.setProfile(theProfileId);
currentAdContext.setVideoAsset(theVideoAssetId,theVideoDuration);
currentAdContext.setSiteSection(theSiteSectionId);

var videoNotStarted = true;

if (videoWorks) {
   video.controls = false;
   videoControls.classList.remove('hidden');
}

function togglePlay() {
    if (videoNotStarted == true){
        videoNotStarted = false;
        playback();
    } else if (video.paused || video.ended) {
        video.play();
    } else {
        video.pause();
    }
}

function updatePlayButton() {
    playbackIcons.forEach(icon => icon.classList.toggle('hidden'));

    if (video.paused) {
        playButton.setAttribute('data-title', 'Play (k)');
    } else {
        playButton.setAttribute('data-title', 'Pause (k)');
    }
}

function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

    return {
        minutes: result.substr(3, 2),
        seconds: result.substr(6, 2),
    };
}

function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    seek.setAttribute('max', videoDuration);
    progressBar.setAttribute('max', videoDuration);
    const time = formatTime(videoDuration);
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
}

function updateTimeElapsed() {
    const time = formatTime(Math.round(video.currentTime));
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`
    timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
}

function updateProgress() {
    seek.value = Math.floor(video.currentTime);
    progressBar.value = Math.floor(video.currentTime);
}

function updateSeekTooltip(event) {
    const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
    seek.setAttribute('data-seek', skipTo)
    const t = formatTime(skipTo);
    seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
    const rect = video.getBoundingClientRect();
    seekTooltip.style.left = `${event.pageX - rect.left}px`;
}

function skipAhead(event) {
    const skipTo = event.target.dataset.seek;
    video.currentTime = skipTo;
    progressBar.value = skipTo;
    seek.value = skipTo;
}

function updateVolume() {
    if (video.muted) {
        video.muted = false;
    }

    video.volume = volume.value;
}

function updateVolumeIcon() {
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

}

function toggleMute() {
    video.muted = !video.muted;

    if (video.muted) {
        volume.setAttribute('data-volume', volume.vaue);
        volume.value = 0;
    } else {
        volume.value = volume.dataset.volume;
    }
}

function requestAds() {
    prerollSlots = [];
    postrollSlots = [];
    overlaySlots = [];
    midrollSlots = [];

    currentAdContext.addTemporalSlot("Kelsey Preroll", tv.freewheel.SDK.ADUNIT_PREROLL, 0);
    currentAdContext.addTemporalSlot("Kelsey Midroll", tv.freewheel.SDK.ADUNIT_MIDROLL, 5);
    currentAdContext.addTemporalSlot("Kelsey Postroll", tv.freewheel.SDK.ADUNIT_POSTROLL, 60);

    currentAdContext.addKeyValue("kelseyTargeting", "kdowd");

    var displayBaseId = "displayBase";
    
    currentAdContext.registerVideoDisplayBase(displayBaseId);

    currentAdContext.addEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE, onRequestComplete);
    currentAdContext.addEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED, onSlotEnded);

    currentAdContext.submitRequest();

}

function onRequestComplete(event) {
    console.log("request complete");

    if (event.success) {
        var fwTemporalSlots = currentAdContext.getTemporalSlots();
        for (var i = 0; i < fwTemporalSlots.length; i++) {
            var slot = fwTemporalSlots[i];
            var slotTimePositionClass = slot.getTimePositionClass();
            if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL) {
                prerollSlots.push(slot);
            } else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL) {
                postrollSlots.push(slot);
            } else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL) {
                midrollSlots.push(slot);
            }
        }
    }
}

function playback() {
    if (prerollSlots.length) {
        playPreroll();
    } else {
        playContent();
    }
}

function playPreroll() {
    if (prerollSlots.length) {
        console.log("\n==============PREROLL==============\n");
        videoControls.hidden = true;
        prerollSlots.shift().play();
    } else  {
        playContent();
    }
}

function playPostroll() {
    if (postrollSlots.length) {
        console.log("\n==============POSTROLL==============\n");
        videoControls.hidden = true;
        postrollSlots.shift().play();
    } else {
        cleanUp();
    }
}

function playContent() {
    videoControls.hidden = false;
    video.src = contentSrc;
    console.log("\n==============playing content==============\n");
    video.addEventListener('ended', onContentVideoEnded);
    video.addEventListener('timeupdate', onContentVideoTimeUpdated);
    contentState = "VIDEO_STATE_PLAYING";
    currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
    video.play();
}

function onSlotEnded(event) {
    var slotTimePositionClass = event.slot.getTimePositionClass();
    if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL) {
        console.log("==============previous preroll slot ended==============");
        playPreroll();
    } else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL) {
        console.log("==============previous postroll slot ended==============");
        playPostroll();
    } else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL) {
        console.log("==============previous midroll slot ended==============");
        resumeContentAfterMidroll();
    }
}

function onContentVideoEnded() {
    if (contentState === "VIDEO_STATE_PLAYING") {
        console.log("\n==============content ended==============\n");
        currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_COMPLETED);
        this.contentState = tv.freewheel.SDK.VIDEO_STATE_COMPLETED;
        if(postrollSlots.length){
            playPostroll();
        }
    }
}

function onContentVideoTimeUpdated() {
    for (var i = 0; i < midrollSlots.length; i++) {
        var midrollSlot = midrollSlots[i];
        var slotTimePosition = midrollSlot.getTimePosition();
        var videoCurrentTime = video.currentTime;

        if (Math.abs(videoCurrentTime - slotTimePosition) < 0.5) {
            contentPausedAt = videoCurrentTime;
            video.pause();
            currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PAUSED);
            contentState = "VIDEO_STATE_PAUSED";
            midrollSlots.splice(i, 1);
            videoControls.hidden = true;
            midrollSlot.play();
        }
    }
}

function resumeContentAfterMidroll() {
    videoControls.hidden = false;
    video.src = contentSrc;
    video.currentTime = contentPausedAt;
    console.log("===========resume video after: " + contentPausedAt);
    contentState = "VIDEO_STATE_PLAYING";
    currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
    video.play();
}

function cleanUp() {
    console.log("goodbye");
    videoNotStarted = false;
    videoControls.hidden = false;
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