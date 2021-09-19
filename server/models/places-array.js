const {LocationInfo} = require("../game-logic/location-configs.js");


/**
 * A serializable representation of PlacesArray.
 * Namely, it only contains property state, so its fields are disjoint from LocationInfo and excludes
 * any non-property locations.
 */
class PlacesArrayRecord {
	build() {
		// Initialize state for each property location. Add the place's index to identify the place after
		// non-properties are removed.
		return LocationInfo
			.map((place, index) => [place.price, index])
			.filter(([price, placeIdx]) => price > 0)
			.map(([price, placeIdx]) => ({
				placeIdx,
				ownerNum: -1,
				houseCount: 0,
				isMortgaged: false
			}));
	}
}

class PlacesArray {

	build(placeRecords) {
		// Bootstrap the record's property state with LocationInfo.
		const placeStateMap = Object.fromEntries(placeRecords.map(({placeIdx, ...placeState}) => [placeIdx, placeState]));

		return LocationInfo.map((placeConfig, placeIdx) =>
			placeConfig.price > 0 ? {
				...placeStateMap[placeIdx],
				...placeConfig
			} : placeConfig
		);
	}

	serialize(placesArray) {
		// Remove all non-property locations, and extract only the property state fields.
		return placesArray
			.map((place, index) => [place, index])
			.filter(([place, placeIdx]) => place.price > 0)
			.map(([place, placeIdx]) => ({
				placeIdx,
				ownerNum: place.ownerNum,
				houseCount: place.houseCount,
				isMortgaged: place.isMortgaged
			}));
	}
}

module.exports = {
	PlacesArray,
	PlacesArrayRecord
};