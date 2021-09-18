const assert = require("assert");
const {LocationInfo} = require("../location-configs.js");
const {PlacesArrayRecord, PlacesArray} = require("../game.js");

describe("PlacesArrayRecord", function () {

	describe("#build()", function () {
		it("should initialize state for all properties", function () {
			const expected = [
				{ placeIdx: 1, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 3, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 5, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 6, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 8, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 9, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 11, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 12, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 13, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 14, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 15, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 16, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 18, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 19, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 21, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 23, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 24, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 25, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 26, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 27, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 28, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 29, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 31, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 32, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 34, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 35, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 37, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 39, ownerNum: -1, houseCount: 0, isMortgaged: false }
			]

			assert.deepEqual(PlacesArrayRecord.prototype.build(), expected);
		});
	});
});

describe("PlacesArray", function () {

	describe("#build()", function () {
		it("should merge the location configs with state from the records", function () {
			const inputPlaceRecords = [
				{ placeIdx: 1, ownerNum: 0, houseCount: 5, isMortgaged: true },
				{ placeIdx: 3, ownerNum: 1, houseCount: 10, isMortgaged: false }
			];

			const expected = [...LocationInfo];
			expected[1] = {...expected[1], ...{ ownerNum: 0, houseCount: 5, isMortgaged: true }};
			expected[3] = {...expected[3], ...{ ownerNum: 1, houseCount: 10, isMortgaged: false }};

			const actual = PlacesArray.prototype.build(inputPlaceRecords)

			assert.equal(actual.length, 40);
			assert.deepEqual(actual, expected);
		});
	});

	describe("#serialize()", function () {
		it("should extract the property state", function () {
			const expected = [
				{ placeIdx: 1, ownerNum: 0, houseCount: 5, isMortgaged: true },
				{ placeIdx: 3, ownerNum: 1, houseCount: 10, isMortgaged: false },
				{ placeIdx: 5, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 6, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 8, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 9, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 11, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 12, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 13, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 14, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 15, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 16, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 18, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 19, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 21, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 23, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 24, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 25, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 26, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 27, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 28, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 29, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 31, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 32, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 34, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 35, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 37, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 39, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined }
			];

			const input = [...LocationInfo];
			input[1] = {...input[1], ...{ ownerNum: 0, houseCount: 5, isMortgaged: true }};
			input[3] = {...input[3], ...{ ownerNum: 1, houseCount: 10, isMortgaged: false }};

			const actual = PlacesArray.prototype.serialize(input);

			assert.equal(actual.length, 28);
			assert.deepEqual(actual, expected);
		});
	});
});
