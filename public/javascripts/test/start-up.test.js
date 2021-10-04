import assert from "./assert.js";
import {places} from "../location-configs.js";
import {startUp} from "../start-up.js";

function houseImageNames(placeIdx) {
	const propertyImages = [...$("#house-plot" + placeIdx).children("img")];
	return propertyImages.map(image => image.src.substring(image.src.lastIndexOf("/") + 1));
}

describe("Start Up", () => {
	describe("#startUp()", () => {
		const spriteFileName = "https://cdn2.bulbagarden.net/upload/archive/0/0d/20130810072317%21025Pikachu.png";
		const basePlayer = {
			balance: 1500,
			placeIdx: 0,
			savedMessages: []
		};

		const playerData = [
			{name: "Boop", num: 0, spriteFileName, ...basePlayer},
			{name: "Boop", num: 1, spriteFileName, ...basePlayer},
			{name: "Boop", num: 2, spriteFileName, ...basePlayer},
			{name: "Boop", num: 3, spriteFileName, ...basePlayer},
			{name: "Boop", num: 4, spriteFileName, ...basePlayer}
		];

		playerData[0].balance = 800;
		playerData[1].placeIdx = 14;// Virginia Avenue
		playerData[0].savedMessages = [
			["log", "some message"],
			["offer-unowned-property", {placeIdx: 3}]
		];

		playerData[2].jailDays = 1;
		playerData[2].numJailCards = 2;
		playerData[2].placeIdx = 10;

		places[11].ownerNum = 0;
		places[11].houseCount = 2;
		places[16].ownerNum = 0;
		places[18].ownerNum = 0;
		places[19].ownerNum = 0;

		startUp({
			playerData,
			locationData: places,
			monopolies: [[16, 18, 19]],
			yourPlayerId: 0,
			currentPlayerId: 0,
			tax: 500
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

		it("should replay all message logs and offers", () => {
			const messages = [...$("#message-box").contents()].map(x => x.textContent.trim());
			assert.deepEqual(messages, [
				"some message",
				"",
				"Boop, would you like to buy Baltic Avenue for $60?",
				""
			]);
		});

		it("should load the current free parking cash pool", () => {
			assert.equal(500, GlobalState.tax);
		});

	});
});