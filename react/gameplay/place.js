import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import ImmutableModel from "/javascripts/gameplay/immutable-model.js";

/**
 * Given a dehydrated state of the properties (locationData), build an array of 40 places.
 */
function hydratePlaces(locationData) {
	const locationDataByIdx = Object.fromEntries(locationData
		.map(({placeIdx, ownerNum, houseCount, isMortgaged}) => [placeIdx, {ownerNum, houseCount, isMortgaged}]));

	const places = PlaceConfigs.map((placeConfig, placeIdx) => {
		const {ownerNum, houseCount, isMortgaged} = (placeIdx in locationDataByIdx) ?
			locationDataByIdx[placeIdx] :
			{ownerNum: -1, houseCount: 0, isMortgaged: false};

		return new Place(placeIdx, placeConfig, ownerNum, houseCount, isMortgaged);
	});

	return places;	
}

class Place extends ImmutableModel {
	constructor(placeIdx, {name, price, rents, housePrice, color, cardColor, imageName}, ownerNum, houseCount, isMortgaged) {
		super();
		this.name = name;
		this.price = price;
		this.rents = rents;
		this.housePrice = housePrice;
		this.color = color;
		this.cardColor = cardColor;
		this.imageName = imageName;

		this.placeIdx = placeIdx;
		this.ownerNum = ownerNum;
		this.houseCount = houseCount;
		this.isMortgaged = isMortgaged;
	}
}

export {
	hydratePlaces,
	Place
};