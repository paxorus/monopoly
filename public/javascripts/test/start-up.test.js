import assert from "./assert.js";
import {startUp} from "../start-up.js";

function houseImageNames(placeIdx) {
	const propertyImages = [...$("#house-plot" + placeIdx).children("img")];
	return propertyImages.map(image => image.src.substring(image.src.lastIndexOf("/") + 1));
}

describe("Start Up", () => {
	describe("#startUp()", () => {
		const playerData = [
			new Player("Boop", 0, "/0/0d/025Pikachu.png"),
			new Player("Boop", 1, "/0/0d/025Pikachu.png"),
			new Player("Boop", 2, "/0/0d/025Pikachu.png"),
			new Player("Boop", 3, "/0/0d/025Pikachu.png"),
			new Player("Boop", 4, "/0/0d/025Pikachu.png")
		];

		playerData[0].balance = 800;
		playerData[1].placeIdx = 14;// Virginia Avenue

		playerData[2].jailDays = 1;
		playerData[2].numJailCards = 2;
		playerData[2].placeIdx = 10;

		const locationData = [
			{placeIdx: 11, ownerNum: 0, houseCount: 2, isMortgaged: false},
			{placeIdx: 16, ownerNum: 0, houseCount: 0, isMortgaged: false},
			{placeIdx: 18, ownerNum: 0, houseCount: 0, isMortgaged: false},
			{placeIdx: 19, ownerNum: 0, houseCount: 0, isMortgaged: false}
		];

		startUp({
			playerData,
			locationData,
			monopolies: [[16, 18, 19]],
			yourPlayerNum: 0,
			startingPlayerNum: 0
		});

		it("should load the current balance", () => {
			assert.equal($("#bal0").text(), "$800");
		});

		it("should load the current location", () => {
			assert.equal($("#loc1").text(), "Virginia Avenue");
		});

		it("should list the currently owned properties", () => {
			const properties = [...$("#property-list0 .hud-property-name")].map(x => x.textContent);
			assert.deepEqual(properties, ["St. Charles Place", "St. James Place", "Tennessee Avenue", "New York Avenue"]);
		});

		it("should load the current number of houses", () => {
			assert.deepEqual(houseImageNames(11), ["house.svg", "house.svg"]);
		});

		it("should disable the mortgage button if there are houses", () => {
			const isMortgageButtonDisabled = $("#hud-property11 > .property-mortgager").hasClass("button-disabled");
			assert.equal(isMortgageButtonDisabled, true);
		});

		it("should send players with remaining jail time to jail", () => {
			assert.equal($("#marker2").parent().is($("#jail")), true);
		});

		it("should not display a Use button for other players' jail cards", () => {
			assert.equal($("#jail-card2").text(), "Get Out of Jail Free x2");
		});

		it("should load house buttons for the currently owned monopolies", () => {
			[16, 18, 19].forEach(placeIdx => {
				const buttonClassLists = [...$(`#hud-property${placeIdx} .house-button`)].map(x => x.className);
				assert.deepEqual(buttonClassLists, [
					"button house-button property-mortgager",
					"button house-button house-adder",
					"button-negative button-disabled house-button house-remover"
				]);
			});
		});

	});
});