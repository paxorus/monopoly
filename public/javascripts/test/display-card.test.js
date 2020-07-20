import assert from "./assert.js";
import {showCard} from "../display-card.js";
import {GlobalState} from "../startup.js";

function readLocationCard() {
	return $("#location-card").text().trim().replace(/\n\s+/g, "\n").split("\n");
}

describe("Display Card", function () {

	describe("#showCard()", function () {
		it("should display house property rents", function () {
			showCard(1);
			const actual = readLocationCard();

			const expected = [
				"Mediterranean Avenue",
				"Price: $60",
				"Unowned",
				"Rent: $2",
				"With 1 House: $10",
				"With 2 Houses: $30",
				"With 3 Houses: $90",
				"With 4 Houses: $160",
				"With HOTEL: $250",
				"Mortgage Value: $30",
				"$50 Per House",
				"Close"
			];
			assert.deepEqual(actual, expected);
		});

		it("should display railroad rents", function () {
			showCard(5);
			const actual = readLocationCard();

			const expected = [
				"Reading Railroad",
				"Price: $200",
				"Unowned",
				"Rent: $25",
				"2 railroads: $50",
				"3 railroads: $100",
				"4 railroads: $200",
				"Close"
			];
			assert.deepEqual(actual, expected);
		});

		it("should display utility rents", function () {
			showCard(12);
			const actual = readLocationCard();

			const expected = [
				"Electric Company",
				"Price: $150",
				"Unowned",
				"One Utility: 4 times roll",
				"Both Utilities: 10 times roll",
				"Close"
			];
			assert.deepEqual(actual, expected);
		});

		it("should display the free parking cash pool", function () {
			GlobalState.tax = 5000;
			showCard(20);
			const actual = $("#tax-info").text();
			assert.deepEqual(actual, "Cash pool: $5000");
		});
	});
});
