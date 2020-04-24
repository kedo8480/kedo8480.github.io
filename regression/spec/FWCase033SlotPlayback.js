tv.freewheel.regression.FWCase033SlotPlayback = {};

describe("Slot.pause() and Slot.resume() Test", function() {

	beforeEach(function() {
	});

	it("should pause and resume temporal slots", function(done) {
		var instance = new tv.freewheel.DemoPlayer();
		instance.requestAds();
		console.log('-------------------------------------HEY--------------------------------');
		console.log(instance);
		console.log('-------------------------------------Current Ad Context--------------------------------');
		console.log(instance.currentAdContext);
		console.log('-------------------------------------Ad Request--------------------------------');
		console.log(instance.currentAdContext._adRequest);

		console.log('-------------------------------------Temporal Slots--------------------------------');
		console.log(instance.currentAdContext.getTemporalSlots());

		console.log('-------------------------------------KeyValues--------------------------------');
		console.log(instance.currentAdContext._adRequest._keyValues);

		expect(instance.currentAdContext._adRequest._keyValues, ['xfinityTargeting=targetingTest', '_fw_gdpr=', '_fw_gdpr_consent=']);
		expect(instance.currentAdContext._adRequest._keyValues, 'THIS IS A THING THAT WRONG');

		instance.playback();

	})
});
