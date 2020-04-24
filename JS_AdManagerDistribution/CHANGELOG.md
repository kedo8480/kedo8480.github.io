## Change Log

**6.35.0**

- FW-4753 [JS] Implement DashRenderer using dash.js.
    - Supports playback of MPEG-DASH content.
    - Uses version 3.0.3 of dash.js.
    - dash.js is loaded in the freewheel namespace, so it won't interfere if a different version of dash.js is loaded as part of the client app.
    - Add new constant ERROR_DASHJS, which is used by DashRenderer to report errors that were triggered by dash.js.
    - If PARAMETER_DESIRED_BITRATE is set, the value will be used to set the video initialBitrate setting in dash.js.

**6.34.0**

- EPU-1305 [JS] Adopt IAB's TCF/CMP API 2.0 in AdManager to Retrieve GDPR Consent Data
    - Technical specifications for IAB Europe Transparency and Consent Framework 2.0 can be found at https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md
    - Parameter 'tv.freewheel.SDK.PARAMETER_USE_CMP' is renamed to 'tv.freewheel.SDK.PARAMETER_USE_GDPR_TCFAPI'
    - Add new constant PARAMETER_CONSENT_RETRIEVAL_TIMEOUT to customize the consent retrieval timeout value in millisecond. The default value is 500 millisecond.
    - Beginning with 6.34.0, AdManager will not be compatible with TCF/CMP API 1.0 and 1.1. Clients need to update to TCF/CMP API 2.0 if using AdManager version 6.34.0 or later. JS AdManager versions 6.28.0 - 6.33.0 will only support TCF/CMP API 1.0 and 1.1.

**6.33.0**

- EPU-1245 [JS] Adopt IAB's USP API in AdManager for CCPA to retrieve consent data
    - Technical specifications for IAB's USP API framework can be found at https://iabtechlab.com/wp-content/uploads/2019/11/US-Privacy-USER-SIGNAL-API-SPEC-v1.0.pdf
    - The parameter 'tv.freewheel.SDK.PARAMETER_USE_CCPA_USPAPI' is enabled by default. Please note that the key-value for \_fw_us_privacy should not be manually added into the ad request when the parameter 'tv.freewheel.SDK.PARAMETER_USE_CCPA_USPAPI' is enabled. To turn off use of the USP API, set the 'tv.freewheel.SDK.PARAMETER_USE_CCPA_USPAPI' parameter to false.

**6.32.0**

- EPU-1218 [JS] Retrieve GDPR Params without SafeFrames using PostMessage

**6.31.0**

- EPU-1134 [JS] Stop currently playing slot on context disposal, and fixed an issue that the VPAID creative loaded event listener is not removed on renderer disposal

**6.30.0**

- EPU-1085 [JS] Fixed an issue that Android User Agent is not parsed correctly for Android 9 and 10 devices

- EPU-1055 [JS] Reduce time latency on fetching GDPR consent

- EPU-898 [JS] Replace GDPR key values if already existing. In case where the consent configuration is set on the AdRequestConfiguration object, values of keys "\_fw\_gdpr" and "\_fw\_gdpr\_consent" would be replaced by GDPR consent values

**6.29.0**

In 6.25, we announced the deprecation of Dynamic (Auto-Update) AdManager.js and LinkTag2.js Library URLs of the following formats effective September 25, 2018, as well as their scheduled removal on September 1, 2019. While Dynamic (Auto-Update) AdManager.js Library URLs are now deprecated, we are suspending their removal until a later date, not to be before Q3, 2020. All URLs predating the release of AdManager 6.25 will continue pointing to their respective AdManager.js versions. Please note that the latest released LinkTag2 is still version 6.11.0.

- http://adm.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js
- https://mssl.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js
- http://adm.fwmrm.net/p/[]/AdManager.js
- https://mssl.fwmrm.net/p/[]/AdManager.js
- http://adm.fwmrm.net/p/release/latest-JS/wrp/prd/LinkTag2.js
- https://mssl.fwmrm.net/p/release/latest-JS/wrp/prd/LinkTag2.js
- http://adm.fwmrm.net/p/[]/LinkTag2.js
- https://mssl.fwmrm.net/p/[]/LinkTag2.js

Moving forward AdManager.js and LinkTag2.js Library URLs should adhere to the following formatting:

- http://adm.fwmrm.net/libs/adm/[VERSION]/AdManager.js
- https://mssl.fwmrm.net/libs/adm/[VERSION]/AdManager.js
- http://adm.fwmrm.net/libs/adm/[VERSION]/LinkTag2.js
- https://mssl.fwmrm.net/libs/adm/[VERSION]/LinkTag2.js


- EPU-947 [JS] Remove duplicate timeout error message from ExtensionManager.js
	- This change prevents a duplicate timeout error message from firing when an extension failed to load due to a URL request timeout
	- This change is not backwards compatible

- EPU-962 [JS] Fixed loading an invalid empty extension when the parameter with key autoLoadExtension is null.

- EPU-950 [JS] Support get parameters on AdInstance level.
        - New API: AdInstance.getParameter(paramName)

**6.28.0**

- EPU-635 [JS] Copy key value pairs to the newContext returned for the newContextWithContext() API
- EPU-893 [JS] Support backward compatible VPAID creative loading
	- Please set the parameter, tv.freewheel.SDK.PARAMETER_DISABLE_CORS_ENFORCEMENT, to false to enable CORS enforcement
	- By default, AdManager sets tv.freewheel.SDK.PARAMETER_DISABLE_CORS_ENFORCEMENT to true, disabling CORS enforcement

- EPU-793 [JS] Adopt IAB's CMP API in AdManager for GDPR to retrieve consent data
    - Technical specifications for IAB Europe Transparency and Consent Framework can be found at https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework
    - The parameter 'tv.freewheel.SDK.PARAMETER_USE_CMP' is enabled by default. Please note that the key-values for \_fw_gdpr and \_fw_gdpr_consent should not be manually added into the ad request when the parameter 'tv.freewheel.SDK.PARAMETER_USE_CMP' is enabled, as doing so might result in inconsistent selection of ads.

**6.27.0**

- EPU-845 [JS] Configure auto pausing ads when the browser/tab loses user focus. Please use the parameter tv.freewheel.SDK.PARAMETER_AUTO_PAUSE_AD_ONVISIBILITYCHANGE to enable/disable the functionality

**6.26.0**

- EPU-801 [JS] Honor the value of PARAMETER_VPAID_CREATIVE_TIMEOUT_DELAY parameter when loading a VPAID ad
- EPU-765 [JS] Improve information accuracy of error beacons of VPAID ads so that when a VPAID ad cannot be loaded, AdManager dispatches \_e_security, \_e_io and \_e_timeout beacons accordingly, instead of firing \_e_timeout regardless of the reason

**6.25.0**

In 6.24 we announced new URLs for the player to retrieve AdManager.js and LinkTag2.js, in which the version number is explicitly specified and will not auto upgrade when newer versions are released:

- http://adm.fwmrm.net/libs/adm/[]/AdManager.js
- https://mssl.fwmrm.net/libs/adm/[]/AdManager.js
- http://adm.fwmrm.net/libs/adm/[]/LinkTag2.js
- https://mssl.fwmrm.net/libs/adm/[]/LinkTag2.js

Previously used URLs will be deprecated starting from the release of 6.25, and will be removed on September 1, 2019. The URLs to be deprecated are of the following formats:

- http://adm.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js
- https://mssl.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js
- http://adm.fwmrm.net/p/[]/AdManager.js
- https://mssl.fwmrm.net/p/[]/AdManager.js
- http://adm.fwmrm.net/p/release/latest-JS/wrp/prd/LinkTag2.js
- https://mssl.fwmrm.net/p/release/latest-JS/wrp/prd/LinkTag2.js
- http://adm.fwmrm.net/p/[]/LinkTag2.js
- https://mssl.fwmrm.net/p/[]/LinkTag2.js

All URLs predating the release of AdManager 6.25 will continue pointing to their respective AdManager.js versions until removal on September 1, 2019. Please note that the latest released LinkTag2 is version 6.11.0.

**6.24.0**

- EPU-701 [JS] Fixed an issue where a linear ad resumes after user explicitly pauses the playback, navigates to a new tab and returns to the original tab
- EPU-667 [JS] Set the "rel" attribute for potential security issue that is triggered by opening a new window
- EPU-660 [JS] Trim last digit of AdManager version from 4 to 3 digits

**6.23.0.0**
- EPU-572 [JS] AdManager will pause the current playing ad if the current tab is inactive and resumes when the tab becomes active.
- EPU-603 [JS] Fixed issues reported by linters.

**6.22.0.0**
- EPU-556 [JS] Fix warnings reported by linters.

**6.21.0.0**
- EPU-462 [JS] Support the event EVENT_AD_AUTO_PLAY_BLOCKED in all browsers that don't support autoplay, including mobile browsers. For further information, please refer to https://hub.freewheel.tv/display/techdocs/Auto-play+Video+Blocking+and+Solution.

- EPU-203 [JS] Support ad resizing better during ad playback by adding new API Context.resize(). The player should call this API to report the new player size to the FW SDK whenever the player's size has changed.
    - New API: Context.resize(width, height)

**6.19.5.0**
- EPU-456 [JS] Support EVENT_AD_AUTO_PLAY_BLOCKED for Chrome starting from version 64. This event will be dispatched when a video ad starts if the browser does not allow video autoplay, so that the player can respond by adding a "play" button. For further information, please refer to https://hub.freewheel.tv/display/techdocs/Auto-play+Video+Blocking+and+Solution.

**6.19.0.0**
- EPU-159 [JS] VAST 4 - Support the VAST <Error> node returned in VAST 3&4 responses.
    - The following VAST codes are supported:
        - 100: XML parsing error
        - 101: VAST schema validation error
        - 102: VAST version of response not supported
        - 200: VAST tracking error
        - 201: VAST linearity not mach error
        - 301: VAST URI time out error
        - 302: VAST wrapper limit reached error
        - 303: No VAST response after one or more Wrappers error
        - 400: General Linear error. Video player is unable to display the Linear Ad
        - 500: General NonLinearAds error
        - 600: General CompanionAds error
        - 901: General VPAID error
    - For further information, please refer to the IAB VAST4 doc section 2.3.6 (https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/)

- EPU-163 [JS] VAST 4 - Support the VAST macros [CONTENTPLAYHEAD], [CACHEBUSTING], [ASSETURI], [TIMESTAMP] in tracking URLs returned by VAST responses
    - For further information, please refer to the IAB VAST4 doc section 2.3.7 (https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/)

- EPU-263 [JS] Support limit on maximum Wrapper count. Faild if too many Wrapper responses have been received with no InLine response.The default maximum Wrapper count is 5.
    - New API
        - Constant: PARAMETER_VAST_MAX_WRAPPER_COUNT

- EPU-262 [JS] Support VAST URI timeout. The default timeout is 5000 milliseconds.
    - New API
        - Constant: PARAMETER_VAST_TIMEOUT_IN_MILLISECONDS

**6.18.0.0**
- EPU-224 [JS] Support Universal Ad ID in VAST 4
    - New API: AdInstance.getUniversalAdId()

- EPU-272 [JS] Support Safari 11
    - Safari 11 brings new restrictions for autoplaying video content on Desktop. Added support to handle these restrictions gracefully and informing the player when faced

**6.17.6.0**
- EPU-244 [JS] Mitigate Safari 11's new policy of blocking videos from auto-playing

**6.17.0.0**
- EPU-134 [JS] Fix the null pointer exception thrown when cancelling the timeout event after the event handler has been removed in the VPAID renderer
- EPU-228 [JS] Fail gracefully if a bad VPAID creative dispatches AdStopped event instead of AdStarted event or AdError event after startAd() is invoked

**6.16.4.0**
- EPU-226 [JS] Add the class "fw_vpaid_slot" to the div that is created by VPAID renderer and passed to VPAID creatives

**6.16.2.0**
- EPU-194 [JS] Dispatch ad event EVENT_AD_MEASUREMENT with concrete event ID in the event payload.

**6.16.0.0**
- EPU-95 [JS] Support VAST3 single ad and improve fault tolerance of VAST tags with no Creatives node.

**6.15.4.0**
- ESC-6628 [JS] Pass multiple CDATA blocks in VAST AdParameters node as one concatenated string to VPAID Creatives

**6.14.3.1**
- ESC-6048 [JS] Fixed the problem that VPAID Resume ad event is not dispatched on mobile browser when ad is clicked and switched back.
- ESC-6086 [JS] Fixed the problem that VPAIDRenderer does not carry volume in setAdVolume function before invoking initAd().

**6.14.2.0**
- ESC-6084 [iOS/tvOS] Admanager and player crashes when VIDEO ad does not contain a URL

**6.14.0.1**
- ESC-5674 [JS] Fixed an exception thrown after the last postroll video in slot ends.

**6.13.0.0**
- OPP-8135 [JS] Dispatch new runtime events from Context objects:
    - Ad event EVENT_AD with the following event names:
        - EVENT_AD_INITIATED
        - EVENT_AD_SKIPPED
        - EVENT_BUFFERING_START
        - EVENT_BUFFERING_END
    -  EVENT_CONTENT_PAUSED
    -  EVENT_CONTENT_RESUMED
-  ESC-5478 [JS] Fixed a bug that the ad is clickable when being loaded.
-  INK-14718 [JS] Update the logic of rendition selection to honour ad replica ID.

**6.12.5**
- OPP-7785 [JS] Support changing ad volume.
    -  New APIs
        -  Context.setAdVolume(vol)
        -  Context.getAdVolume()
        -  Ad event EVENT_AD with event name EVENT_AD_VOLUME_CHANGE.
- OPP-7783 [JS] Support pausing and resuming temporal slots.
    - New APIs
        - Slot.pause()
        - Slot.resume()

**6.12.0**
- OPP-5602 [JS] Update setSiteSection and setVideoAsset function to accept both string value and int value as Site Section Fallback ID and Video Asset Fallback ID.

**6.11.2**
- ESC-4915 [JS] Fixed the issue that causes an exception to be thrown when setLogLevel() is called by embedded video players in iframes in Chrome.

**6.11.1.1**
- ESC-4894 [JS] Fixed the issue that content videos crashes in BrightCove players after the preroll slot ends in Firefox.

**6.11.1**
- ESC-4889 [JS] Fixed the issue that the source of the content video cannot be restored by the Content Video Extension after a preroll slot ends.

**6.11.0**
- OPP-7285 [JS] Dispatch the request initiated Event immediately after Context.submitRequest() is called.
