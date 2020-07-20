const assert = require("assert");
const {obeyLocation} = require("../obey-location.js");

describe("Obey Location", function () {
	describe("#obeyLocation()", function () {
		it("should offer property if unowned", function () {
			const emitted = [];
			obeyLocation({
				placeIdx: 1,
				emit: (x, y) => emitted.push([x, y])
			});

			assert.deepEqual(emitted, [["offer-unowned-property", {placeIdx: 1}]]);
		});
	});
});
