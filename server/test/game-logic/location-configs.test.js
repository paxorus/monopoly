const assert = require("assert");
const {Locations, propertyComparator} = require("../../game-logic/location-configs.js");

describe("Location Configs", () => {

	describe("#propertyComparator()", () => {
		it("should sort properties correctly (residential < utilities < railroads)", () => {
			const actual = [
				Locations.Boardwalk,
				Locations.StCharlesPlace,
				Locations.ShortLine,
				Locations.ReadingRailroad,
				Locations.WaterWorks,
				Locations.ElectricCompany
			].sort(propertyComparator);

			assert.deepEqual(actual, [
				Locations.StCharlesPlace,
				Locations.Boardwalk,
				Locations.ElectricCompany,
				Locations.WaterWorks,
				Locations.ReadingRailroad,
				Locations.ShortLine
			]);
		});
	});
});
