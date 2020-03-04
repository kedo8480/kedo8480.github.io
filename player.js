/*
FreeWheel
*/

var tv = tv || {};
tv.freewheel = tv.freewheel || {};
tv.freewheel.DemoPlayer = function() {

	// Step #1: Obtain content metadata
	var theNetworkId = 96749;
	var theServerURL = "http://demo.v.fwmrm.net/ad/g/1";
	var theProfileId = "96749:kelsey-js-player"
	var theVideoAssetId = "defaultVideo";
	var theSiteSectionId  = "defaultSite_defaultSection";
	var theVideoDuration = 500;
	adDataRequested = false;
	currentAdContext = null;
	videoNotStarted = true;

	// Step #2: Initialize AdManager
	// Only one AdManager instance is needed for each player
	this.adManager = new tv.freewheel.SDK.AdManager();
	this.adManager.setNetwork(theNetworkId);
	this.adManager.setServer(theServerURL);

	// Saving content src to play after the preroll finishes
	videoElement = document.getElementById('videoPlayer');
	contentSrc = videoElement.currentSrc;
	currentPlayingSlotType = null;

	// Saving the content time when midroll starts so that content resumes after midroll finishes
	contentPausedOn = 0;

	// Creating ad context
	currentAdContext = this.adManager.newContext();
	currentAdContext.setProfile(theProfileId);
	currentAdContext.setVideoAsset(theVideoAssetId,theVideoDuration);
	currentAdContext.setSiteSection(theSiteSectionId);
};

tv.freewheel.DemoPlayer.prototype = {
	requestAds: function() {
		// Step #3: Configure ad request
		prerollSlots = [];
		postrollSlots = [];
		midrollSlots = [];

		// Add 1 preroll, 1 midroll, 1 postroll slot
		currentAdContext.addTemporalSlot("Preroll", tv.freewheel.SDK.ADUNIT_PREROLL, 0);
		currentAdContext.addTemporalSlot("Midroll", tv.freewheel.SDK.ADUNIT_MIDROLL, 5);
		currentAdContext.addTemporalSlot("Postroll", tv.freewheel.SDK.ADUNIT_POSTROLL, 60);

		currentAdContext.addKeyValue("kelseyTargeting", "kdowd");

		// Let context object knows where to render the ad
		var theDisplayBaseId = "displayBase";
		currentAdContext.registerVideoDisplayBase(theDisplayBaseId);

		// Step #4: Submit ad request

		// Listen to AdManager Events
		currentAdContext.addEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE,this.onRequestComplete.bind(this));
		currentAdContext.addEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED,this.onSlotEnded.bind(this));

		// Submit ad request
		currentAdContext.submitRequest();

		// Store corresponding content video state (PLAYING, COMPLETED, PAUSED)
		contentState = "";
	},

	// Step #4: Listen for ad request completed and set all slot variables
	onRequestComplete: function(event) {
		// After request completes, store each roll in corresponding slot array
		if (event.success) {
			var fwTemporalSlots = currentAdContext.getTemporalSlots();
		    for (var i = 0; i < fwTemporalSlots.length; i++)
		    {
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

	togglePlay: function() {
		if (videoNotStarted == true){
			videoNotStarted = false;
			console.log("YOU ARE HERE AT BEGINNING OF PLAY CYCLE");
			this.playback();
		} else if (videoElement.paused || videoElement.ended) {
			console.log("YOU PLAYED THE VIDEO AFTER PAUSING");
			videoElement.play();
		} else {
			console.log("YOU PAUSED THE VIDEO");
			videoElement.pause();
		}
	},

	fastForward: function() {
		console.log("YOU ARE INSIDE FF");
		videoElement.playbackRate = 4;
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
			console.log("\n==============playing preroll==============\n");
			prerollSlots.shift().play();
		} else {
			// When there are no more preroll slots to play, play content
			this.playContent();
		}
	},

	// Step #6: Play content video
	playContent: function() {
		// Play video content, and add event listener to trigger when video time updates or video content ends
		$.each(videoElement, function(){ videoElement.controls = true; });
		videoElement.src = contentSrc;
		console.log("\n==============playing content==============\n");
		videoElement.addEventListener('ended', this.onContentVideoEnded.bind(this));
		videoElement.addEventListener('timeupdate', this.onContentVideoTimeUpdated.bind(this));
		contentState = "VIDEO_STATE_PLAYING";
		currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
		videoElement.play();
	},

	resumeContentAfterMidroll: function() {
		// Resume playing content from when the midroll cue
		$.each(videoElement, function(){ videoElement.controls = true; });
		videoElement.src = contentSrc;
		videoElement.currentTime = contentPausedOn;
		console.log("===========resume video after: " + contentPausedOn);
		videoElement.addEventListener('ended', this.onContentVideoEnded.bind(this));
		contentState = "VIDEO_STATE_PLAYING";
		currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
		videoElement.play();
	},

	// Step #8: Play postroll advertisements when content ends
	playPostroll: function() {
		// Play postroll(s) if exits, otherwise cleanup
		if (postrollSlots.length) {
			console.log("\n==============playing postroll==============\n");
			postrollSlots.shift().play();
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

		// Re-enable the play button after all slot ends
		$("#start").attr('disabled', false);
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
				videoElement.removeEventListener('ended', this.onContentVideoEnded.bind(this));
				videoElement.pause();
				currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PAUSED);
				contentState = "VIDEO_STATE_PAUSED";
				midrollSlots.splice(i, 1);
				midrollSlot.play();
				return;
			}

		}
	},

	// Step #8: Play postroll advertisements when content ends
	onContentVideoEnded: function() {
		// Unbind the event listener for detecting when the content video ends, and play postroll if any
		if (contentState === "VIDEO_STATE_PLAYING") {
			console.log("\n==============content ended==============\n");
			videoElement.removeEventListener('ended', this.onContentVideoEnded.bind(this));
			currentAdContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_COMPLETED);
			this.contentState = tv.freewheel.SDK.VIDEO_STATE_COMPLETED
			if(postrollSlots.length){
				this.playPostroll();
			}
		}
	},

	cleanUp: function() {
		// Clean up after postroll ended or content ended(no postroll)
		currentAdContext.removeEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE,this.onRequestComplete.bind(this));
		currentAdContext.removeEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED,this.onSlotEnded.bind(this));
		if (currentAdContext) {
			currentAdContext = null;
			location.reload();
		}
	}
};
