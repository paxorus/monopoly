import assert from "./assert.js";
import {
	addGetOutOfJailFreeCard,
	buyHouse,
	sellHouse,
	updateGetOutOfJailFreeCards
} from "../execute-turn.js";

function houseImageNames(placeIdx) {
	const propertyImages = [...$("#board").children().eq(placeIdx).children("img")];
	return propertyImages.map(image => image.src.substring(image.src.lastIndexOf("/") + 1));
}

describe("Execute Turn", function () {

	describe("#addGetOutOfJailFreeCard()", function () {
		it("should update the number of jail cards in possession", function () {
			assert.equal($("#jail-card0").text(), "");

			addGetOutOfJailFreeCard(GlobalState.me);
			assert.equal($("#jail-card0").text(), "Get Out of Jail FreeUse Card");

			addGetOutOfJailFreeCard(GlobalState.me);
			assert.equal($("#jail-card0").text(), "Get Out of Jail Free x2Use Card");

			updateGetOutOfJailFreeCards(GlobalState.me);
			assert.equal($("#jail-card0").text(), "Get Out of Jail Free x1Use Card");

			updateGetOutOfJailFreeCards(GlobalState.me);
			assert.equal($("#jail-card0").text(), "");
		});
	});

	describe("#buyHouse()", function () {
		it("should update the number of houses/hotels on the property", function () {

			const placeIdx = 6;
			assert.deepEqual(houseImageNames(placeIdx), []);

			buyHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg"]);

			buyHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg", "house.svg"]);

			buyHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg", "house.svg", "house.svg"]);

			buyHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg", "house.svg", "house.svg", "house.svg"]);

			buyHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["hotel.svg"]);

			sellHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg", "house.svg", "house.svg", "house.svg"]);

			sellHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg", "house.svg", "house.svg"]);

			sellHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg", "house.svg"]);

			sellHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), ["house.svg"]);

			sellHouse(GlobalState.me, placeIdx);
			assert.deepEqual(houseImageNames(placeIdx), []);
		});
	});

});

