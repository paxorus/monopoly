const assert = require("assert");
const {obeyLocation} = require("../../game-logic/obey-location.js");

describe("Obey Location", () => {

	describe("#obeyLocation()", () => {
		it("should offer property if unowned", () => {
			const emitted = [];
			obeyLocation({
				placeIdx: 1,
				game: {
					places: [
						{},
						{price: 500, ownerNum: -1}
					]
				},
				emit: (x, y) => emitted.push([x, y])
			});

			assert.deepEqual(emitted, [["offer-unowned-property", {placeIdx: 1}]]);
		});
	});
});
