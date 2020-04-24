beforeEach(function() {
	var matchers = {
		toEqualSlotEvents: function() {
			return {
				compare: function(actualSlotEvents, expectedSlotEvents) {
					var result = {
						pass: false,
						message: ''
					}
					if (actualSlotEvents.length != expectedSlotEvents.length) {
						result.message = 'Actual count of slot events ' + actualSlotEvents.length + ' is not equal to expected count of slot events ' + expectedSlotEvents.length;
						return result;
					}
					for (var i = 0; i < actualSlotEvents.length; i++) {
						var actualSlotEvent = actualSlotEvents[i];
						var expectedSlotEvent = expectedSlotEvents[i];
						if (actualSlotEvent.eventName !== expectedSlotEvent.eventName) {
							result.message += 'Actual slot event name ' + actualSlotEvent.eventName + ' is not equal to expected slot event name ' + expectedSlotEvent.eventName + '\n';
						}
						if (actualSlotEvent.payload.slot.getCustomId() != expectedSlotEvent.payload.slot.getCustomId()) {
							result.message += 'Actual slot custom ID ' + actualSlotEvent.payload.slot.getCustomId() + ' is not equal to expected slot custom ID ' + expectedSlotEvent.payload.slot.getCustomId() + '\n';
						}

						if (result.message) {
							result.message += "====================================================================================\n"
						};
					}
					return result.message? result : { pass: true }
				}
			}
		},

		toEqualAdEvents: function() {
			return {
				compare: function(actualAdEvents, expectedAdEvents) {
					var result = {
						pass: false,
						message: ''
					}
					if (actualAdEvents.length != expectedAdEvents.length) {
						var actualAdEventsString = "";
						for (var i = 0; i < actualAdEvents.length; i++) {
							actualAdEventsString = actualAdEventsString + "\n" + actualAdEvents[i].payload.subType
						};
						var expectedAdEventsString = "";
						for (var i = 0; i < expectedAdEvents.length; i++) {
							expectedAdEventsString = expectedAdEventsString + "\n" + expectedAdEvents[i].payload.subType
						};
						result.message = 'Actual count of ad events ' + actualAdEvents.length + ' is not equal to expected count of ad events ' + expectedAdEvents.length
						+ '\nObserved Ad Events:\n' + actualAdEventsString
						+ '\nExpected Ad Events:\n' + expectedAdEventsString;
						return result;
					}
					for (var i = 0; i < actualAdEvents.length; i++) {
						var actualAdEvent = actualAdEvents[i];
						var expectedAdEvent = expectedAdEvents[i];
						if (actualAdEvent.eventName !== expectedAdEvent.eventName) {
							result.message += 'Actual ad event name ' + actualAdEvent.eventName + ' is not equal to expected ad event name ' + expectedAdEvent.eventName + '\n';
						}
						if (actualAdEvent.payload.subType != expectedAdEvent.payload.subType) {
							result.message += 'Actual ad event sub-type ' + actualAdEvent.payload.subType + ' is not equal to expected ad event sub-type ' + expectedAdEvent.payload.subType + ' for expected ad ' + expectedAdEvent.payload.adInstance.getAdId() + '\n';
						}
						if (actualAdEvent.payload.slot.getCustomId() != expectedAdEvent.payload.slot.getCustomId()) {
							result.message += 'Actual slot ' + actualAdEvent.payload.slot.getCustomId() + ' is not equal to expected slot ' + expectedAdEvent.payload.slot.getCustomId() + '\n';
						}
						if (actualAdEvent.payload.adInstance.getAdId() != expectedAdEvent.payload.adInstance.getAdId()) {
							result.message += 'Actual ad ' + actualAdEvent.payload.adInstance.getAdId() + ' is not equal to expected ad ' + expectedAdEvent.payload.adInstance.getAdId() + '\n';
						}
						if (expectedAdEvent.payload.concreteEventId && actualAdEvent.payload.concreteEventId != expectedAdEvent.payload.concreteEventId) {
							result.message += 'Actual concrete event Id ' + actualAdEvent.payload.concreteEventId + ' is not equal to expected concrete event Id ' + expectedAdEvent.payload.concreteEventId + '\n';
						}
						if (expectedAdEvent.payload.errorCode && actualAdEvent.payload.errorCode != expectedAdEvent.payload.errorCode) {
							result.message += 'Actual error code ' + actualAdEvent.payload.errorCode + ' is not equal to expected error code ' + expectedAdEvent.payload.errorCode + '\n';
						}
						if (expectedAdEvent.payload.errorModule && actualAdEvent.payload.errorModule != expectedAdEvent.payload.errorModule) {
							result.message += 'Actual error module ' + actualAdEvent.payload.errorModule + ' is not equal to expected error module ' + expectedAdEvent.payload.errorModule + '\n';
						}
						if (expectedAdEvent.payload.vastErrorCode && actualAdEvent.payload.vastErrorCode != expectedAdEvent.payload.vastErrorCode) {
							result.message += 'Actual VAST error code ' + actualAdEvent.payload.vastErrorCode + ' is not equal to expected VAST error code ' + expectedAdEvent.payload.vastErrorCode + '\n';
						}
						if (result.message) {
							result.message += "====================================================================================\n"
						};
					}
					return result.message? result : { pass: true }
				}
			}
		},

		//check to contain one certain ad event;
		toContainAdEvent: function() {
			return {
				compare: function(actualAdEvents, expectedAdEvent) {
					var result = {
						pass: false,
						message: ''
					}
					if (!actualAdEvents) {
						result.message = 'There is no event dispatched';
						return result;
					}
					for (var i = 0; i < actualAdEvents.length; i++) {
						var actualAdEvent = actualAdEvents[i];
						if (actualAdEvent.eventName == expectedAdEvent.eventName &&
							actualAdEvent.payload.subType == expectedAdEvent.payload.subType &&
							actualAdEvent.payload.slot.getCustomId() == expectedAdEvent.payload.slot.getCustomId() &&
							actualAdEvent.payload.adInstance.getAdId() == expectedAdEvent.payload.adInstance.getAdId() &&
							!(expectedAdEvent.payload.errorCode && actualAdEvent.payload.errorCode != expectedAdEvent.payload.errorCode) &&
							!(expectedAdEvent.payload.errorModule && actualAdEvent.payload.errorModule != expectedAdEvent.payload.errorModule) &&
							!(expectedAdEvent.payload.vastErrorCode && actualAdEvent.payload.vastErrorCode != expectedAdEvent.payload.vastErrorCode)) {
								return {pass: true};
							}
						}
						return result;
					}
				}
			},

			//check to contain specific events;
			toContainEvents: function() {
				return {
					compare: function(actualAdEventsSet, expectedAdEvents) {
						var result = {
							pass: false,
							message: ''
						}
						if (actualAdEventsSet.size == 0) {
							result.message = 'There is no event dispatched';
							return result;
						}
						for (var i = 0; i < expectedAdEvents.length; i++) {
							var expectedAdEvent = expectedAdEvents[i];
							if (!actualAdEventsSet.has(expectedAdEvent)) {
								result.message += expectedAdEvent + ' is not dispatched \n'
							}
						}
						return result.message? result : { pass: true };
					}
				}
			},

			toEqualMethodsInvoked: function() {
				return {
					compare: function(actualMethodsInvoked, expectedMethodsInvoked) {
						var result = {
							pass: false,
							message: ''
						}

						if (actualMethodsInvoked.length != expectedMethodsInvoked.length) {
							result.message = 'Actual count of methods invoked ' + actualMethodsInvoked.length + ' is not equal to expected count of methods invoked ' + expectedMethodsInvoked.length;
							return result;
						}

						for (var i = 0; i < actualMethodsInvoked.length; i++) {
							var actualMethod = actualMethodsInvoked[i];
							var expectedMethod = expectedMethodsInvoked[i];
							if (actualMethod.methodName !== expectedMethod.methodName) {
								result.message += 'Actual method name ' + actualMethod.methodName + ' is not equal to expected method  name ' + expectedMethod.methodName + '\n';
							}
							if (actualMethod.moduleId != expectedMethod.moduleId) {
								result.message += 'Actual method module ID ' + actualMethod.moduleId + ' is not equal to expected method module ID ' + expectedMethod.moduleId + '\n';
							}
							if (actualMethod.slotCustomId != expectedMethod.slotCustomId) {
								result.message += 'Actual method slot ' + actualMethod.slotCustomId + ' is not equal to expected method slot ' + expectedMethod.slotCustomId + '\n';
							}
							if (actualMethod.adId != expectedMethod.adId) {
								result.message += 'Actual method adId' + actualMethod.adId + ' is not equal to expected method adId ' + expectedMethod.adId + '\n';
							}
							if (actualMethod.params && expectedMethod.params) {
								if (actualMethod.params.volume != expectedMethod.params.volume) {
									result.message += 'Actual method params volume' + actualMethod.params.volume + ' is not equal to expected method params volume ' + expectedMethod.params.volume + '\n';
								}
							} else if ((!actualMethod.params && expectedMethod.params) || (actualMethod.params && !expectedMethod.params)) {
								result.message += 'Actual method params ' + actualMethod.params + ' is not equal to expected method params ' + expectedMethod.params + '\n';
							}

							if (result.message) {
								result.message += "====================================================================================\n"
							};
						}
						return result.message? result : { pass: true }
					}
				}
			},

			//check to contain one certain method invoked;
			toContainMethodInvoked: function() {
				return {
					compare: function(actualMethodsInvoked, expectedMethodInvoked) {
						var result = {
							pass: false,
							message: ''
						}
						if (!actualMethodsInvoked) {
							result.message = 'There is no method invoked';
							return result;
						}
						for (var i = 0; i < actualMethodsInvoked.length; i++) {
							var actualMethod = actualMethodsInvoked[i];
							if (actualMethod.methodName == expectedMethodInvoked.methodName &&
								actualMethod.moduleId == expectedMethodInvoked.moduleId &&
								actualMethod.slotCustomId == expectedMethodInvoked.slotCustomId &&
								actualMethod.adId == expectedMethodInvoked.adId) {
									if (!actualMethod.params && !expectedMethodInvoked.params) {
										return {pass: true};
									} else if (actualMethod.params && expectedMethodInvoked.params &&
										actualMethod.params.volume == expectedMethodInvoked.params.volume) {
											return {pass: true};
										}
									}
								}
								return result;
							}
						}
					},

					toEqualExtensionEvents: function() {
						return {
							compare: function(actualExtensionEvents, expectedExtensionEvents) {
								var result = {
									pass: false,
									message: ''
								};
								if (actualExtensionEvents.length != expectedExtensionEvents.length) {
									var actualExtensionEventsString = "";
									for (var i = 0; i < actualExtensionEvents.length; i++) {
										actualExtensionEventsString = actualExtensionEventsString + "\n" + actualExtensionEvents[i].payload.moduleName
									};
									var expectedExtensionEventsString = "";
									for (var i = 0; i < expectedExtensionEvents.length; i++) {
										expectedExtensionEventsString = expectedExtensionEventsString + "\n" + expectedExtensionEvents[i].payload.moduleName
									};
									result.message = 'Actual count of extension events ' + actualExtensionEvents.length + ' is not equal to expected count of extension events ' + expectedExtensionEvents.length
									+ '\nObserved extension events:\n' + actualExtensionEventsString
									+ '\nExpected extension events:\n' + expectedExtensionEventsString;									
									return result;
								}
								for (var i = 0; i < actualExtensionEvents.length; i++) {
									var actualExtensionEvent = actualExtensionEvents[i];
									var expectedExtensionEvent = expectedExtensionEvents[i];
									if (actualExtensionEvent.eventName != expectedExtensionEvent.eventName) {
										result.message += 'Actual extension event name ' + actualExtensionEvent.eventName + ' is not equal to expected extension event name ' + expectedExtensionEvent.eventName;
									}
									if (actualExtensionEvent.payload.success != expectedExtensionEvent.payload.success) {
										result.message += 'Actual extension event success ' + actualExtensionEvent.payload.success + ' is not equal to expected extension event success ' + expectedExtensionEvent.payload.success;
									}
									if (actualExtensionEvent.payload.moduleName != expectedExtensionEvent.payload.moduleName) {
										result.message += 'Actual extension event moduleName ' + actualExtensionEvent.payload.moduleName + ' is not equal to expected extension event moduleName ' + expectedExtensionEvent.payload.moduleName;
									}
									if (!actualExtensionEvent.payload.success && (actualExtensionEvent.payload.errorVal != expectedExtensionEvent.payload.errorVal)) {
										result.message += 'Actual extension event errorVal ' + actualExtensionEvent.payload.errorVal + ' is not equal to expected extension event errorVal ' + expectedExtensionEvent.payload.errorVal;
									}

									if (result.message) {
										result.message += "====================================================================================\n"
									};
								}
								return result.message? result : { pass: true }
							}
						}
					},

					toEqualExtensionEventsIgnoreOrder: function() {
						return {
							compare: function(actualExtensionEvents, expectedExtensionEvents) {
								var result = {
									pass: false,
									message: ''
								};
								if (actualExtensionEvents.length != expectedExtensionEvents.length) {
									var actualExtensionEventsString = "";
									for (var i = 0; i < actualExtensionEvents.length; i++) {
										actualExtensionEventsString = actualExtensionEventsString + "\n" + actualExtensionEvents[i].payload.moduleName
									};
									var expectedExtensionEventsString = "";
									for (var i = 0; i < expectedExtensionEvents.length; i++) {
										expectedExtensionEventsString = expectedExtensionEventsString + "\n" + expectedExtensionEvents[i].payload.moduleName
									};
									result.message = 'Actual count of extension events ' + actualExtensionEvents.length + ' is not equal to expected count of extension events ' + expectedExtensionEvents.length
									+ '\nObserved extension events:\n' + actualExtensionEventsString
									+ '\nExpected extension events:\n' + expectedExtensionEventsString;									
									return result;
								}
								for (var i = 0; i < actualExtensionEvents.length; i++) {
									var actualExtensionEvent = actualExtensionEvents[i];
									var hasSameEvent = false;
									for (var j = 0; j < expectedExtensionEvents.length; j++) {
										var expectedExtensionEvent = expectedExtensionEvents[j];
										if (actualExtensionEvent.eventName != expectedExtensionEvent.eventName ||
											actualExtensionEvent.payload.success != expectedExtensionEvent.payload.success ||
											actualExtensionEvent.payload.moduleName != expectedExtensionEvent.payload.moduleName ||
											actualExtensionEvent.payload.errorVal != expectedExtensionEvent.payload.errorVal) {
											continue;
										} else {
											hasSameEvent = true;
											expectedExtensionEvents.splice(i, 1);
											break;
										}
									}
									if (!hasSameEvent) {
										result.message += 'Actual extension event ' + actualExtensionEvent.payload.moduleName + ' is not existing in expected events list. \n'
										break;
									}
								}
								return result.message? result : { pass: true }
							}
						}
					},

					toEqualAdRequests: function() {
						return {
							compare: function(actualAdRequests, expectedAdRequests) {
								var result = {
									pass: false,
									message: ''
								}
								if (actualAdRequests.length != expectedAdRequests.length) {
									result.message = 'Actual count of ad requests ' + actualAdRequests.length + ' is not equal to expected count of ad requests ' + expectedAdRequests.length;
									return result;
								}
								for (var i = 0; i < actualAdRequests.length; i++) {
									var actualAdRequest = actualAdRequests[i];
									var expectedAdRequest = expectedAdRequests[i];
									var failMessage = 'Actual ad request' + actualAdRequest + ' is not equal to expected ad request ' + expectedAdRequest + '\n';
									if (actualAdRequest.substring(0, actualAdRequest.indexOf('?')) != expectedAdRequest.substring(0, expectedAdRequest.indexOf('?'))) {
										result.message += failMessage;
										continue;
									}
									var actualQueryArray = actualAdRequest.substring(actualAdRequest.indexOf('?')+1).split(';');
									var expectedQueryArray = expectedAdRequest.substring(expectedAdRequest.indexOf('?')+1).split(';');
									if (actualQueryArray.length != expectedQueryArray.length) {
										result.message += failMessage;
										continue;
									}
									for (var j = 0; j < actualQueryArray.length; j++) {
										var actualQuery = actualQueryArray[j];
										var expectedQuery = expectedQueryArray[j];
										var actualParams = {};
										var expectedParams = {};
										var actualQuerySplitArray = actualQuery.split('&');
										var expectedQuerySplitArray = expectedQuery.split('&');
										if (actualQuery) {
											for (var k = 0; k < actualQuerySplitArray.length; k++) {
												var keyvalue = actualQuerySplitArray[k].split('=');
												if (keyvalue.length == 2) {
													actualParams[keyvalue[0]] = keyvalue[1];
												}
											}
										}
										if (expectedQuery) {
											for (var k = 0; k < expectedQuerySplitArray.length; k++) {
												var keyvalue = expectedQuerySplitArray[k].split('=');
												if (keyvalue.length == 2) {
													expectedParams[keyvalue[0]] = keyvalue[1];
												}
											}
										}
										if (actualQuerySplitArray.length != expectedQuerySplitArray.length) {
											result.message += "The total count of keys in actualParams--" + actualQuerySplitArray.length + " is not equal to the one in expectedParams--" + expectedQuerySplitArray.length;
											break;
										}
										for (var key in expectedParams) {
											if (key === "_fw_h_x_flash_version" || key === "_fw_dpr") {
												continue;
											}
											if (!actualParams.hasOwnProperty(key) || actualParams[key] != expectedParams[key]) {
												result.message += failMessage;
												break;
											}
										}
									}
								}
								return result.message? result : { pass: true }
							}
						}
					},

					toEqualTrackingSequence: function() {
						return {
							compare: function(actualTrackingSequence, expectedTrackingSequence) {
								var result = {
									pass: false,
									message: ''
								}
								if (actualTrackingSequence.length != expectedTrackingSequence.length) {
									result.message = 'Actual count of tracking URLs ' + actualTrackingSequence.length + ' is not equal to expected count of tracking URLs ' + expectedTrackingSequence.length
									+ '\nObserved Tracking URLs:\n' + actualTrackingSequence.join("\n")
									+ '\nExpected Tracking URLs:\n' + expectedTrackingSequence.join("\n");
									return result;
								}
								for (var i = 0; i < actualTrackingSequence.length; i++) {
									var actualCallback = actualTrackingSequence[i];
									var expectedCallback = expectedTrackingSequence[i];

									if (actualCallback.indexOf('fwmrm.net') >= 0) {
										if (actualCallback.substring(0, actualCallback.indexOf('?')) != expectedCallback.substring(0, expectedCallback.indexOf('?'))) {
											result.message += 'Actual tracking URL:\n' + actualCallback + '\nis not equal to expected tracking URL\n' + expectedCallback + '\n';
											continue;
										}
										var actualQuery = actualCallback.substring(actualCallback.indexOf('?')+1).split('&');
										var expectedQuery = expectedCallback.substring(expectedCallback.indexOf('?')+1).split('&');
										var actualParams = {};
										var expectedParams = {};
										for (var j = 0; j < actualQuery.length; j++) {
											var keyvalue = actualQuery[j].split('=');
											if (keyvalue.length == 2) {
												actualParams[keyvalue[0]] = keyvalue[1];
											}
										}
										for (var j = 0; j < expectedQuery.length; j++) {
											var keyvalue = expectedQuery[j].split('=');
											if (keyvalue.length == 2) {
												expectedParams[keyvalue[0]] = keyvalue[1];
											}
										}
										for (var key in expectedParams) {
											if (!actualParams.hasOwnProperty(key) || actualParams[key] != expectedParams[key]) {
												result.message += 'Actual tracking URL:\n' + actualCallback + ' is not equal to expected tracking URL:\n' + expectedCallback + '\nfor key: ' + key + '\n\n\n';
												break;
											}
										}
									}
								}
								return result.message? result : { pass: true }
							}
						}
					},

					//check to contain one certain tracking url;
					toContainTrackingURL: function() {
						return {
							compare: function(actualTrackingSequence, expectedCallback) {
								var result = {
									pass: false,
									message: ''
								}
								if (!actualTrackingSequence) {
									result.message = 'There is no tracking url.';
									return result;
								}
								for (var i = 0; i < actualTrackingSequence.length; i++) {
									var actualCallback = actualTrackingSequence[i];
									if (actualCallback.indexOf('fwmrm.net') >= 0) {
										if (actualCallback.substring(0, actualCallback.indexOf('?')) != expectedCallback.substring(0, expectedCallback.indexOf('?'))) {
											result.message += 'Actual tracking URL' + actualCallback + ' is not equal to expected tracking URL ' + expectedCallback + '\n';
											continue;
										}
										var actualQuery = actualCallback.substring(actualCallback.indexOf('?')+1).split('&');
										var expectedQuery = expectedCallback.substring(expectedCallback.indexOf('?')+1).split('&');
										var actualParams = {};
										var expectedParams = {};
										for (var j = 0; j < actualQuery.length; j++) {
											var keyvalue = actualQuery[j].split('=');
											if (keyvalue.length == 2) {
												actualParams[keyvalue[0]] = keyvalue[1];
											}
										}
										for (var j = 0; j < expectedQuery.length; j++) {
											var keyvalue = expectedQuery[j].split('=');
											if (keyvalue.length == 2) {
												expectedParams[keyvalue[0]] = keyvalue[1];
											}
										}
										var doesContain = true;
										for (var key in expectedParams) {
											doesContain = doesContain && (actualParams[key] == expectedParams[key]);
										}
										if (doesContain) {
											return {pass: true};
										} else {
											continue;
										}
									}
								}
								return result;
							}
						}
					},

					toEqualTrue: function() {
						return {
							compare: function(actualCase) {
								var result = {
									pass: false,
									message: ''
								}
								if (!actualCase) {
									result.message = 'Expected: true , but actual: false';
									return result;
								}
								var allowedMargin = 1;
								result.pass = actualCase
								return result;
							}
						}
					},

					toEqualRect: function() {
						return {
							compare: function(actualRect, expectedRect) {
								var result = {
									pass: false,
									message: ''
								}
								if (!actualRect) {
									result.message = 'There is not a valid rect.';
									return result;
								}
								var allowedMargin = 1;
								result.pass = 	Math.abs(actualRect.top - expectedRect.top) <= allowedMargin &&
								Math.abs(actualRect.left - expectedRect.left) <= allowedMargin  &&
								Math.abs(actualRect.height - expectedRect.height) <= allowedMargin  &&
								Math.abs(actualRect.width - expectedRect.width) <= allowedMargin ;
								return result;
							}
						}
					},

					toEqualHTMLElements: function() {
						return {
							compare: function(actualHTMLElements, expectedHTMLElements) {
								var result = {
									pass: false,
									message: ''
								}
								if (!actualHTMLElements || actualHTMLElements.length == 0) {
									result.message = 'There is not a valid HTML element.';
									return result;
								}
								if (actualHTMLElements.length != expectedHTMLElements.length) {
									result.message = 'Actual count of HTML elements ' + actualHTMLElements.length + ' is not equal to expected count of HTML elements ' + expectedHTMLElements.length;
									return result;
								}
								for (var i = 0; i < actualHTMLElements.length; i++) {
									var actualHTMLElement = actualHTMLElements[i];
									var expectedHTMLElement = expectedHTMLElements[i];
									if (!actualHTMLElement.isEqualNode(expectedHTMLElement)) {
										result.message += 'Actual HTML element:\n' + actualHTMLElement.outerHTML + '\nis not equal to expected HTML element\n' + expectedHTMLElement.outerHTML + '\n';
										continue;
									}
								}
								return result.message? result : { pass: true };
							}
						}
					}
				};

				jasmine.addMatchers(matchers);
				jasmine.DEFAULT_TIMEOUT_INTERVAL= 500000;

				if (!document.getElementById('displayBase')) {
					var displayBase = document.createElement('div');
					displayBase.setAttribute('id', 'displayBase');
					document.body.appendChild(displayBase);
					var videoElement = document.createElement('video');
					videoElement.setAttribute('id', 'videoPlayer');
					videoElement.setAttribute('width', '480');
					videoElement.setAttribute('height', '270');
					videoElement.setAttribute('playsinline', '');
					videoElement.setAttribute('src', 'http://m1.fwmrm.net/m/1/90750/39/1624999/222991497_1423862435_42824_7.mp4');
					displayBase.appendChild(videoElement);

					var displaySlotsDiv = document.createElement('div');
					displaySlotsDiv.setAttribute('id', 'displaySlotsDiv');
					document.body.appendChild(displaySlotsDiv);
				}
			})
