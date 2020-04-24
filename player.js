/*
FreeWheel
*/
//const adm = require("/JS_AdManagerDistribution/release/AdManager.js");

var tv = tv || {};
tv.freewheel = tv.freewheel || {};
tv.freewheel.DemoPlayer = function() {

	// Step #1: Obtain content metadata
	var networkId = 392025;
	var serverURL = "https://5fb59.v.fwmrm.net/";
	var profileId = "392025:flex-test-profile"
	var videoAssetId = "xfinity_test_video";
	var siteSectionId  = "xfinity_test_site_section";
	var videoDuration = 500;
	adDataRequested = false;
	// this.currentAdContext = null;

	// Used to determine if video has been started in togglePlay()
	videoStarted = false;

	// Used to determine if an ad is playing
	adPlaying = false;

	// Used to keep track of current slot playing
	currentSlot = null;

	// Step #2: Initialize AdManager
	// Only one AdManager instance is needed for each player
	this.adManager = new tv.freewheel.SDK.AdManager();
	this.adManager.setNetwork(networkId);
	this.adManager.setServer(serverURL);

	// Saving content src to play after the preroll finishes
	videoElement = document.getElementById('videoPlayer');
	contentSrc = videoElement.currentSrc;
	currentPlayingSlotType = null;

	// Saving the content time when midroll starts so that content resumes after midroll finishes
	contentPausedOn = 0;

	// Creating ad context
	this.currentAdContext = this.adManager.newContext();
	this.currentAdContext.setProfile(profileId);
	this.currentAdContext.setVideoAsset(videoAssetId,videoDuration);
	this.currentAdContext.setSiteSection(siteSectionId);

	// Turn off ad click for Flex
	this.currentAdContext.setParameter("renderer.video.clickDetection", false, tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);

	// Setting up bindings
	this.videoSpeedHandler = this.videoSpeedHandler.bind(this);
	this.onRequestComplete = this.onRequestComplete.bind(this);
	this.onSlotEnded = this.onSlotEnded.bind(this);
	this.onContentVideoTimeUpdated = this.onContentVideoTimeUpdated.bind(this);
	this.onContentVideoEnded = this.onContentVideoEnded.bind(this);
};

tv.freewheel.DemoPlayer.prototype = {
	requestAds: function() {
		// Step #3: Configure ad request
		prerollSlots = [];
		postrollSlots = [];
		midrollSlots = [];

		// Add 1 preroll, 1 midroll, 1 postroll slot
		this.currentAdContext.addTemporalSlot("Preroll", tv.freewheel.SDK.ADUNIT_PREROLL, 0);
		this.currentAdContext.addTemporalSlot("Midroll", tv.freewheel.SDK.ADUNIT_MIDROLL, 20);
		this.currentAdContext.addTemporalSlot("Postroll", tv.freewheel.SDK.ADUNIT_POSTROLL, 653);

		// Add Target Key Value
		this.currentAdContext.addKeyValue("xfinityTargeting", "targetingTest");

		this.currentAdContext.setCapability(tv.freewheel.SDK.CAPABILITY_SLOT_TEMPLATE, tv.freewheel.SDK.CAPABILITY_STATUS_OFF);

		// Let context object knows where to render the ad
		var displayBaseId = "displayBase";
		this.currentAdContext.registerVideoDisplayBase(displayBaseId);

		// Step #4: Submit ad request

		// Listen to AdManager Events
		this.currentAdContext.addEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE,this.onRequestComplete);
		this.currentAdContext.addEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED,this.onSlotEnded);

		// Submit ad request
		this.currentAdContext.submitRequest();

		// Store corresponding content video state (PLAYING, COMPLETED, PAUSED)
		contentState = "";

		// Add listener for remote input
		document.addEventListener("keydown", this.videoSpeedHandler);
	},

	// Step #4: Listen for ad request completed and set all slot variables
	onRequestComplete: function(event) {
		// After request completes, store each roll in corresponding slot array
		if (event.success) {
			var fwTemporalSlots = this.currentAdContext.getTemporalSlots();
		    for (var i = 0; i < fwTemporalSlots.length; i++) {
		     	var slot = fwTemporalSlots[i];
		     	var slotTimePositionClass = slot.getTimePositionClass();
		     	if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL) {
		     		prerollSlots.push(slot);
		     	} else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL) {
		     		midrollSlots.push(slot);
		     	} else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL) {
		     		postrollSlots.push(slot);
		     	}
			}
		}
	},

	// Set up functions for both remote and keyboard inputs
	videoSpeedHandler: function(event) {
		switch (event.keyCode) {
			case 32: // Spacebar
			case 179: // Play/Pause on Remote
			case 13: // OK on Remote
				this.togglePlay();
				break;
			case 39: // Right arrow key
			case 228: // Fast Forward on Remote
				this.fastForward();
				break;
			case 37: // Left arrow key
			case 227: // Rewind on Remote
				this.rewind();
				break;
		}
	},

	// Toggles between play and pause on video, if video has not started
	// it starts playback with preroll content
	togglePlay: function() {
		if (videoStarted == false){
			videoStarted = true;
			this.playback();
		} else if (videoElement.paused || videoElement.ended) {
			videoElement.play();
			if (adPlaying == true) {
				currentSlot.resume();
			}
		} else {
			videoElement.pause();
			if (adPlaying == true) {
				currentSlot.pause();
			}
		}
	},

	// Jumps video forward 15 seconds
	fastForward: function() {
		if (adPlaying == false) {
			videoElement.currentTime += 15;
		}
	},

	// Jumps video back by 5 seconds
	rewind: function() {
		if (adPlaying == false) {
			videoElement.currentTime -= 15;
		}
	},

	// Step #5: Play preroll
	playback: function() {
		// Play preroll(s) if a preroll slot exits, otherwise play content
		if (prerollSlots.length) {
			this.playPreroll();
		} else {
			this.playContent();
		}
	},

	playPreroll: function() {
		// Play preroll slot and then remove the played slot from preroll slot array
		if (prerollSlots.length) {
			adPlaying = true;
			console.log("\n==============playing preroll==============\n");
			currentSlot = prerollSlots.shift();
			currentSlot.play();
		} else {
			// When there are no more preroll slots to play, play content
			this.playContent();
		}
	},

	// Step #6: Play content video
	playContent: function() {
		// Play video content, and add event listener to trigger when video time updates or video content ends
		videoElement.controls = true;
		videoElement.src = contentSrc;
		console.log("\n==============playing content==============\n");
		adPlaying = false;
		videoElement.addEventListener('ended', this.onContentVideoEnded);
		videoElement.addEventListener('timeupdate', this.onContentVideoTimeUpdated);
		contentState = "VIDEO_STATE_PLAYING";
		this.currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
		videoElement.play();
	},

	resumeContentAfterMidroll: function() {
		// Resume playing content from when the midroll cue
		videoElement.controls = true;
		videoElement.src = contentSrc;
		videoElement.onloadeddata = (event) => {
			videoElement.currentTime = contentPausedOn;
			videoElement.play();
		};
		adPlaying = false;
		console.log("===========resume video after: " + contentPausedOn);
		videoElement.addEventListener('ended', this.onContentVideoEnded);
		contentState = "VIDEO_STATE_PLAYING";
		this.currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
	},

	// Step #8: Play postroll advertisements when content ends
	playPostroll: function() {
		// Play postroll(s) if exits, otherwise cleanup
		if (postrollSlots.length) {
			adPlaying = true;
			console.log("\n==============playing postroll==============\n");
			currentSlot = postrollSlots.shift();
			currentSlot.play();
		} else {
			this.cleanUp();
		}
	},

	// Step #5: Add event listener for onSlotEnded
	onSlotEnded: function(event) {
		// Play the next preroll/postroll ad when either a preroll or postroll stops
		// For a midroll slot, call resumeContentAfterMidroll() and wait for next midroll(if any)
		var slotTimePositionClass = event.slot.getTimePositionClass();
		if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL) {
			console.log("==============previous preroll slot ended==============");
			this.playPreroll();
		} else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL) {
			console.log("==============previous postroll slot ended==============");
			this.playPostroll();
		}  else if (slotTimePositionClass == tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL) {
			console.log("==============previous midroll slot ended==============");
			this.resumeContentAfterMidroll();
		}
	},

	onContentVideoTimeUpdated: function() {
		if (midrollSlots.length == 0) {
			videoElement.removeEventListener('timeupdate', this.onContentVideoTimeUpdated);
		}

		// Step #7: Pause content and play midroll advertisements
		// Check whether midroll needs to be played
		for (var i = 0; i < midrollSlots.length; i++) {
			var midrollSlot = midrollSlots[i];
			var slotTimePosition = midrollSlot.getTimePosition();
			var videoCurrentTime = videoElement.currentTime;

			if (Math.abs(videoCurrentTime - slotTimePosition) < 0.5) {
				contentPausedOn = videoElement.currentTime;
				adPlaying = true;
				videoElement.removeEventListener('ended', this.onContentVideoEnded);
				videoElement.pause();
				this.currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PAUSED);
				contentState = "VIDEO_STATE_PAUSED";
				currentSlot = midrollSlots.shift();
				currentSlot.play();
				return;
			}

		}
	},

	// Step #8: Play postroll advertisements when content ends
	onContentVideoEnded: function() {
		// Unbind the event listener for detecting when the content video ends, and play postroll if any
		if (contentState === "VIDEO_STATE_PLAYING") {
			console.log("\n==============content ended==============\n");
			videoElement.removeEventListener('ended', this.onContentVideoEnded);
			this.currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_COMPLETED);
			this.contentState = tv.freewheel.SDK.VIDEO_STATE_COMPLETED
			if(postrollSlots.length){
				this.playPostroll();
			}
		}
	},

	cleanUp: function() {
		// Clean up after postroll ended or content ended(no postroll)
		this.currentAdContext.removeEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE,this.onRequestComplete);
		this.currentAdContext.removeEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED,this.onSlotEnded);
		if (this.currentAdContext) {
			this.currentAdContext = null;
			location.reload();
		}
	}
};
