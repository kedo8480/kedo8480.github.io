var tv = tv || {};
tv.freewheel = tv.freewheel || {};
tv.freewheel.regression = tv.freewheel.regression || {};
tv.freewheel.regression.dash = tv.freewheel.regression.dash || {};
tv.freewheel.regression.currentSubcase = null;
tv.freewheel.regression.dash.DEFAULT_CONTENT_DURATION = 10;
tv.freewheel.regression.dash.FW_CONTENT_URL = 'http://vi.rnd.fwmrm.net/static/video/dash/Starcraft_10s/manifest.mpd';

tv.freewheel.regression.dash.SubcaseBase = class {
	constructor(adManager, adContext) {
		// Reset the current ad contexts
		tv.freewheel.SDK._instanceCounter = 0;
		tv.freewheel.SDK._instanceQueue = {};

		this.adManager = adManager;
		if (adContext) {
			this.adContext = adManager.newContextWithContext(adContext);
		} else {
			this.adContext = adManager.newContext();
		}
		this.adContext._instanceId = 1;
		tv.freewheel.SDK._instanceQueue['Context_1'] = this.adContext;
		this.videoEl = document.getElementById('videoPlayer');
		this.adContext.registerVideoDisplayBase('displayBase');
		this.contentDuration = tv.freewheel.regression.dash.DEFAULT_CONTENT_DURATION;

		this.preparePlayer();

		this.prerollSlots = [];
		this.midrollSlots = [];
		this.postrollSlots = [];
		this.overlaySlots = [];
		this.displaySlots = [];
		this.adInstances = {};

		this.adRequestCompleteEvents = [];
		this.slotEvents = [];
		this.adEvents = [];
		this.adBufferingEventsSet = new Set();
		this.contentEvents = [];
		this.extensionEvents = [];
		this.methodsInvoked = [];
		this.adRequests = [];
		this.slotTrackingSequence = [];
		this.adTrackingSequence = [];
		this.videoViewTrackingSequence = [];
		this.trackingSequence = [];
		this.lastPlayedTo = 0;

		this.onRequestComplete = this._onRequestComplete.bind(this);
		this.onSlotStarted = this._onSlotStarted.bind(this);
		this.onSlotEnded = this._onSlotEnded.bind(this);
		this.onContentVideoTimeUpdated = this._onContentVideoTimeUpdated.bind(this);
		this.onContentVideoEnded = this._onContentVideoEnded.bind(this);
		this.onContentVideoPauseRequest = this._onContentVideoPauseRequest.bind(this);
		this.onContentVideoResumeRequest = this._onContentVideoResumeRequest.bind(this);
		this.onAdEvent = this._onAdEvent.bind(this);
		this.onExtensionLoaded = this._onExtensionLoaded.bind(this);

		this.deferred = null;
		this.randomNumber = Math.floor(Math.random() * 100000);

		this.returnUrl = "";
		this.submittedRequestCount = 0;
		this.tcfapiScriptSrc = "";
		this.uspapiScriptSrc = "";
		this.retrieveGDPRWithPostMessage = false;
		this.retrieveCCPAWithPostMessage = false;
		this.xmlHttpRequestObj = null;
		this.topMostWindow = "";
		this.timestampOnRequestSubmitted = 0;
		this.timestampOnRequestCompleted = 0;
	}

	shouldPlayOverlaySlots() {
		return !(tv.freewheel.SDK.PLATFORM_NOT_SUPPORT_OVERLAY_AD);
	}

	preparePlayer() {
		if (tv.freewheel.SDK.PLATFORM_IS_MOBILE) {
			this.dashPlayer.setMute(true);
		}
	}

	loadScript(scriptSrc, scriptId) {
		this.xmlHttpRequestObj = new XMLHttpRequest();
		this.xmlHttpRequestObj.open("GET", scriptSrc, false);
		this.xmlHttpRequestObj.send('');

		// the script should be loaded into topmost window; karma loads each test in a separate context, loaded as an iframe
		var parentWindow = window.parent;
		var se = parentWindow.document.createElement('script');
		se.type = 'text/javascript';
		se.text = this.xmlHttpRequestObj.responseText;
		se.id = scriptId;
		parentWindow.document.getElementsByTagName('head')[0].appendChild(se);
	}

	run() {
		this.deferred = $.Deferred();
		this.loadScript("http://cdn.dashjs.org/latest/dash.mediaplayer.min.js", "dashjs");
		this.dashjs = window.parent.dashjs

		this.prepareAdRequest();
		if (this.tcfapiScriptSrc != "") {
			this.adManager._fwTCFAPIExecuted = false;
			this.adManager._fwGDPR = null;
			this.adManager._fwGDPRConsent = null;
			this.loadScript(this.tcfapiScriptSrc, 'tcfapiScript');
			if (this.retrieveGDPRWithPostMessage) {
				this.adManager._retrieveGDPRWithPostMessage();
			} else {
				this.adManager._fetchGDPRData();
			}
		}
		if (this.uspapiScriptSrc != "") {
			this.adManager._fwUSPAPIExecuted = false;
			this.adManager._fwUSPString = null;
			this.loadScript(this.uspapiScriptSrc, 'uspapiScript');
			if (this.retrieveCCPAWithPostMessage) {
				this.adManager._retrieveCCPAWithPostMessage();
			} else {
				this.adManager._fetchCCPAData();
			}
		}
		this.adContext.addEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE, this.onRequestComplete);
		this.adContext.addEventListener(tv.freewheel.SDK.EVENT_EXTENSION_LOADED, this.onExtensionLoaded);
		this.adContext.setParameter(tv.freewheel.SDK.PARAMETER_EXTENSION_CONTENT_VIDEO_ENABLED, false, tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);

		if (this.retrieveGDPRWithPostMessage || this.retrieveCCPAWithPostMessage) {
			setTimeout(function(that){ that.submitAdRequest() }, 3000, this);
		} else {
			this.submitAdRequest();
		}

		return this.deferred.promise();
	}

	prepareAdRequest() {
		this.adContext.setParameter(window.tv.freewheel.SDK.PARAMETER_USE_GDPR_TCFAPI, false, window.tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
		this.adContext.setParameter(window.tv.freewheel.SDK.PARAMETER_USE_CCPA_USPAPI, false, window.tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
		this.adContext.setProfile('505842:vi_regression_js');
		this.adContext.setVideoAsset('unknown', 30);
		this.adContext.setSiteSection('unknown');
	}

	submitAdRequest() {
		this.timestampOnRequestSubmitted = new Date().getTime();
		this.adContext.submitRequest();
	}

	_onRequestComplete(evt) {
		this.timestampOnRequestCompleted = new Date().getTime();
		this.adRequestCompleteEvents.push({
			'eventName': tv.freewheel.SDK.EVENT_REQUEST_COMPLETE,
			'payload' : evt
		});
		this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_REQUEST_COMPLETE, this.onRequestComplete);
		if (evt.success) {
			this.prerollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL);
			this.midrollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL);
			this.postrollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL);
			this.overlaySlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY);
			this.pauseMidrollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_PAUSE_MIDROLL);
			this.displaySlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_DISPLAY);

			this.adContext.addEventListener(tv.freewheel.SDK.EVENT_SLOT_STARTED, this.onSlotStarted);
			this.adContext.addEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED, this.onSlotEnded);
			this.adContext.addEventListener(tv.freewheel.SDK.EVENT_AD, this.onAdEvent);

			for (var i = 0; i < this.prerollSlots.length; i++) {
				var ads = this.prerollSlots[i].getAdInstances();
				this._addAdInstances(ads);
			}
			for (var i = 0; i < this.midrollSlots.length; i++) {
				var ads = this.midrollSlots[i].getAdInstances();
				this._addAdInstances(ads);
			}
			for (var i = 0; i < this.postrollSlots.length; i++) {
				var ads = this.postrollSlots[i].getAdInstances();
				this._addAdInstances(ads);
			}
			for (var i = 0; i < this.overlaySlots.length; i++) {
				var ads = this.overlaySlots[i].getAdInstances();
				this._addAdInstances(ads);
			}
			for (var i = 0; i < this.pauseMidrollSlots.length; i++) {
				var ads = this.pauseMidrollSlots[i].getAdInstances();
				this._addAdInstances(ads);
			}
			for (var i = 0; i < this.displaySlots.length; i++) {
				var ads = this.displaySlots[i].getAdInstances();
				this._addAdInstances(ads);
			}

			var adInstancesKeyToValue = function(itm) {
				return this.adInstances[itm];
			};
			var valuesOfAdInstances = Object.keys(this.adInstances).map(adInstancesKeyToValue.bind(this));
			for (var i = 0; i < valuesOfAdInstances.length; i++) {
				var adInstance = valuesOfAdInstances[i];
				this._replaceMacroInCreativeUrl(adInstance);
			}

			this.prerollSlotsWillPlay();
			this.playPrerollSlots();
		} else {
			console.log('Ad request failed.');
			this.notifySubcaseEnded();
		}
	}

	_replaceMacroInCreativeUrl(adInstance) {
		var creativeRenditions = adInstance.getAllCreativeRenditions();
		for (var j = 0; j < creativeRenditions.length; j++) {
			var creativeRendition = creativeRenditions[j];
			var primaryCreativeRenditionAsset = creativeRendition.getPrimaryCreativeRenditionAsset();
			if (primaryCreativeRenditionAsset != null && primaryCreativeRenditionAsset.getUrl() != null) {
				primaryCreativeRenditionAsset.setUrl(primaryCreativeRenditionAsset.getUrl().replace('#{random}', Math.floor(Math.random() * 1048576)));
			}
		}
	}

	_addAdInstances(_adInstances) {
		for (var i = 0; i < _adInstances.length; i++) {
			var adInstance = _adInstances[i];
			this.adInstances[adInstance.getAdId()] = adInstance;
			this._addAdInstances(adInstance._companionAdInstances);
		};
	}

	prerollSlotsWillPlay() {
		console.log('Preroll slots will play.');
	}

	playPrerollSlots() {
		this.playNextPreroll();
	}

	playNextPreroll() {
		if (this.prerollSlots.length) {
			var slot = this.prerollSlots.shift();
			slot.play();
		} else {
			this.playContentVideo();
		}
	}

	postrollSlotsWillPlay() {
		console.log('Postroll slots will play.');
	}

	playPostrollSlots() {
		this.playNextPostroll();
	}

	playNextPostroll() {
		if (this.postrollSlots.length) {
			var slot = this.postrollSlots.shift();
			slot.play();
		}
	}

	addDisplaySlotBase(slotID, width=300, height=250) {
		var span = document.createElement('span');
		span.setAttribute('id', slotID);
		span.setAttribute('class', "_fwph");

		var form = document.createElement('form');
		form.setAttribute('id', "_fw_form_" + slotID);
		form.setAttribute('style', "display:none");

		var input = document.createElement('input');
		input.setAttribute('type', "hidden");
		input.setAttribute('name', "_fw_input_" + slotID);
		input.setAttribute('id', "_fw_input_" + slotID);
		input.setAttribute('value', "slid=Display_1&tpcl=DISPLAY&w=" + width + "&h=" + height);

		form.appendChild(input)

		var containerSpan = document.createElement('span');
		containerSpan.setAttribute('id', "_fw_container_" + slotID);
		containerSpan.setAttribute("class", "_fwac");

		span.appendChild(form);
		span.appendChild(containerSpan);

		document.getElementById("displaySlotsDiv").appendChild(span);
	}

	notifySubcaseEnded() {
		this.deferred.resolve(true);
	}

	_onSlotStarted(evt) {
		this.slotEvents.push({
			'eventName' : tv.freewheel.SDK.EVENT_SLOT_STARTED,
			'payload' : evt
		});
		var slotTimePositionClass = evt.slot.getTimePositionClass();
	}

	_onSlotEnded(evt) {
		this.slotEvents.push({
			'eventName' : tv.freewheel.SDK.EVENT_SLOT_ENDED,
			'payload' : evt
		});
		var slotTimePositionClass = evt.slot.getTimePositionClass();
		switch (slotTimePositionClass) {
			case tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL:
				this.playNextPreroll();
				break;
			case tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL:
				this.playNextPostroll();
				break;
		}
	}

	finish() {
		console.log('Subcase completed');
		this.resetDashPlayer();
		this.videoEl.src = tv.freewheel.regression.FW_CONTENT_URL;
		if (this.adContext) {
			var displaySlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_DISPLAY);
			for (var i = 0; i < displaySlots.length; i++) {
				var displaySlotSpan = document.getElementById(displaySlots[i].getCustomId());
				if (displaySlotSpan) {
					displaySlotSpan.parentNode.removeChild(displaySlotSpan);
				}
			}
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_SLOT_STARTED, this.onSlotStarted);
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_SLOT_ENDED, this.onSlotEnded);
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_AD, this.onAdEvent);
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_EXTENSION_LOADED, this.onExtensionLoaded);
			this.adContext.dispose();
		}
		var tcfapiScript = window.parent.document.getElementById('tcfapiScript');
		if (tcfapiScript) {
			tcfapiScript.parentNode.removeChild(tcfapiScript);
		}
		this.tcfapiScript = "";
		this.tcfapiScriptSrc = "";

		var uspapiScript = window.parent.document.getElementById('uspapiScript');
		if (uspapiScript) {
			uspapiScript.parentNode.removeChild(uspapiScript);
		}
		this.uspapiScript = "";
		this.uspapiScriptSrc = "";

		if (this.xmlHttpRequestObj) {
			this.xmlHttpRequestObj.abort();
		}
		this.adContext = null;
		this.adManager = null;
	}

	playContentVideo() {
		console.log('Dash content video will start playing.');
		this.initializeDashPlayer();
		if (this.adContext){
			this.adContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
		}
		this.adContext.addEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_PAUSE_REQUEST, this.onContentVideoPauseRequest);
		this.adContext.addEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_RESUME_REQUEST, this.onContentVideoResumeRequest);
		this.dashPlayer.play();
	}

	initializeDashPlayer() {
		this.dashPlayer = this.dashjs.MediaPlayer().create();
		this.dashPlayer.initialize(this.videoEl, tv.freewheel.regression.dash.FW_CONTENT_URL, false);
		var events = this.dashjs.MediaPlayer.events;
		this.dashPlayer.on(events.PLAYBACK_ENDED, this.onContentVideoEnded, this);
		this.dashPlayer.on(events.PLAYBACK_TIME_UPDATED, this.onContentVideoTimeUpdated, this);
	}

	resetDashPlayer() {
		this.dashPlayer.pause();
		var events = this.dashjs.MediaPlayer.events;
		this.dashPlayer.off(events.PLAYBACK_ENDED, this.onContentVideoEnded, this);
		this.dashPlayer.off(events.PLAYBACK_TIME_UPDATED, this.onContentVideoTimeUpdated, this);
		this.dashPlayer.reset();
	}

	getRequestRTT() {
		var rtt = this.timestampOnRequestCompleted - this.timestampOnRequestSubmitted;
		console.log('The roundtrip time of request is ' + rtt.toString());
		return rtt;
	}

	_onContentVideoTimeUpdated(evt) {
		if (this.dashPlayer.time() >= this.contentDuration) {
			this._onContentVideoEnded();
			return;
		}
		if (this.overlaySlots.length == 0 && this.midrollSlots.length == 0){
			return;
		}

		for (var i = 0; i < this.midrollSlots.length; i++) {
			var slot = this.midrollSlots[i];
			var slotTimePosition = slot.getTimePosition();
			var videoCurrentTime = this.dashPlayer.time();

			if (Math.abs(videoCurrentTime - slotTimePosition) < 0.5) {
				this.midrollSlots.splice(i, 1);
				this.dashPlayer.pause();
				if (this.adContext){
					this.adContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PAUSED);
				}
				this.lastPlayedTo = this.dashPlayer.time();
				this.dashPlayer.reset();
				slot.play();
				return;
			}
		}

		if (this.shouldPlayOverlaySlots()) {
			for (var i = 0; i < this.overlaySlots.length; i++) {
				var slot = this.overlaySlots[i];
				var slotTimePosition = slot.getTimePosition();
				var videoCurrentTime = this.dashPlayer.time();

				if (Math.abs(videoCurrentTime - slotTimePosition) < 0.5) {
					this.overlaySlots.splice(i, 1);
					slot.play();
					return;
				}
			}
		}
	}

	_onContentVideoEnded(evt) {
		console.log('Content video has ended playback')
		this.resetDashPlayer();
		if (this.adContext){
			this.adContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_STOPPED);
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_PAUSE_REQUEST, this.onContentVideoPauseRequest);
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_RESUME_REQUEST, this.onContentVideoResumeRequest);
		}
		this.playPostrollSlots();
	}

	_onContentVideoPauseRequest(evt) {
		if (evt) {
			this.contentEvents.push({
				'eventName' : tv.freewheel.SDK.EVENT_CONTENT_VIDEO_PAUSE_REQUEST,
				'payload' : evt
			});
		}
		this.lastPlayedTo = this.dashPlayer.time();
		this.dashPlayer.pause();
		var events = this.dashjs.MediaPlayer.events;
		this.dashPlayer.off(events.PLAYBACK_ENDED, this.onContentVideoEnded, this);
		this.dashPlayer.off(events.PLAYBACK_TIME_UPDATED, this.onContentVideoTimeUpdated, this);
		if (this.adContext){
			this.adContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PAUSED);
		}
	}

	_onContentVideoResumeRequest(evt) {
		if (evt) {
			this.contentEvents.push({
				'eventName' : tv.freewheel.SDK.EVENT_CONTENT_VIDEO_RESUME_REQUEST,
				'payload' : evt
			});
		}
		this.initializeDashPlayer();

		console.log('Seeking the content to ' + (this.lastPlayedTo | 0));
		if (this.dashPlayer.duration() > 0) {
			this.dashPlayer.seek(this.lastPlayedTo | 0);
		}
		this.dashPlayer.play();
		if (this.adContext){
			this.adContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
		}
	}

	_onAdEvent(evt) {
		if (evt.subType.indexOf('adBuffering') == 0) {
			this.adBufferingEventsSet.add(evt.subType);
		} else if (evt.subType !== tv.freewheel.SDK.EVENT_AD_AUTO_PLAY_BLOCKED) {
			// http://wiki.dev.fwmrm.net/display/publicdrafts/Auto-play+Video+Blocking+and+Solution
			this.adEvents.push({
				'eventName': tv.freewheel.SDK.EVENT_AD,
				'payload': evt
			});

			if (evt.subType.indexOf(tv.freewheel.SDK.EVENT_AD_IMPRESSION) == 0) {
				this._onAdImpression(evt);
			};
		}
	}

	_onExtensionLoaded(evt) {
		this.extensionEvents.push({
			'eventName': tv.freewheel.SDK.EVENT_EXTENSION_LOADED,
			'payload': evt
		});
	}

	_onAdImpression(evt) {

	}

	replay() {
		this.lastPlayedTo = 0;
		this.resetDashPlayer();

		if (this.adContext){
			this.adContext.setVideoState(tv.freewheel.SDK.VIDEO_STATE_STOPPED);
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_PAUSE_REQUEST, this.onContentVideoPauseRequest);
			this.adContext.removeEventListener(tv.freewheel.SDK.EVENT_CONTENT_VIDEO_RESUME_REQUEST, this.onContentVideoResumeRequest);
		}
		this.prerollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL);
		this.midrollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL);
		this.postrollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL);
		this.overlaySlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY);
		this.pauseMidrollSlots = this.adContext.getSlotsByTimePositionClass(tv.freewheel.SDK.TIME_POSITION_CLASS_PAUSE_MIDROLL);

		this.prerollSlotsWillPlay();
		this.playPrerollSlots();
	}

	getAdInstanceById(adId) {
		if (this.adInstances.hasOwnProperty(adId)) {
			return this.adInstances[adId];
		}
		return null;
	}

	addURLToTrackingSequence(url) {
		if (url.indexOf('fwmrm.net/ad/g/1') > 0) {
			this.adRequests.push(url);
		} else if (url.indexOf('fwmrm.net/ad/l/1') > 0) {
			this.trackingSequence.push(url);
			var queryArray = url.substring(url.indexOf('?') + 1).split('&');
			for (var i = 0; i < queryArray.length; i++) {
				var keyvalue = queryArray[i].split('=');
				if (keyvalue[0] == 'cn') {
					var callbackName = keyvalue[1];
					if (callbackName == 'videoView') {
						this.videoViewTrackingSequence.push(url);
					} else if (callbackName == 'slotImpression' || callbackName == 'slotEnd') {
						this.slotTrackingSequence.push(url);
					} else if (callbackName == 'defaultImpression' || callbackName == 'adEnd'
						|| callbackName == 'firstQuartile' || callbackName == 'midPoint'
						|| callbackName == 'thirdQuartile' || callbackName == 'complete'
						|| callbackName == 'defaultClick'
						|| callbackName == '_mute' || callbackName == '_un-mute'
						|| callbackName == '_pause' || callbackName == '_resume'
						|| callbackName == '_expand' || callbackName == '_collapse'
						|| callbackName == 'concreteEvent' || callbackName == '3pTracking' || callbackName.indexOf('_e_') !== -1) {
						this.adTrackingSequence.push(url);
					}
					break;
				}
			}
		}
	}
};
