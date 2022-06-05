const assert = require("assert");
const proxyquire = require("proxyquire");
const {getFreshGame} = require("../test-utils/execute-turn-utils.js");
const RandomInt = require("../../fickle/random-int.js");


describe("Execute Turn: Properties", () => {

	let obeyLocationCalls = 0;
	const {
		respondToBuyOffer,
		purchaseProperty,
		buyHouse,
		sellHouse,
		mortgageProperty,
		unmortgageProperty
	} = proxyquire("../../game-logic/execute-turn.js", {
		// Mock out obeyLocation, which is tested separately.
		"./obey-location.js": { obeyLocation() { obeyLocationCalls ++; }}
	});

	describe("#respondToBuyOffer()", () => {
		it("buys the property for the player", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.placeIdx = 1;
			player0.latestRoll = [1, 2];

			respondToBuyOffer(player0, true);

			assert.deepEqual(player0.savedMessages, [
				["dialog", "Congratulations, player 0 name! You now own Mediterranean Avenue!"],
				["allow-conclude-turn", undefined]
			]);
		});

		it("doesn't buy the property for the player", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.placeIdx = 1;
			player0.latestRoll = [1, 2];

			respondToBuyOffer(player0, false);

			assert.deepEqual(player0.savedMessages, [
				["dialog", "Mediterranean Avenue went unsold."],
				["allow-conclude-turn", undefined]
			]);
		});

		it("rolls again for the player on a double", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.placeIdx = 1;
			player0.latestRoll = [2, 2];
			obeyLocationCalls = 0;
			RandomInt._inject(6, 2);

			respondToBuyOffer(player0, false);

			assert.equal(obeyLocationCalls, 1);
			assert.deepEqual(player0.savedMessages, [
				["dialog", "Mediterranean Avenue went unsold."],
				["dialog", "A double!"],
				["dialog", "You rolled a 6 and a 2."],
				["dialog", "You landed on Connecticut Avenue."],
				["allow-conclude-turn", undefined]
			]);
		});
	});

	describe("#purchaseProperty()", () => {
		it("buys a property", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[37].ownerNum = -1;
			game.places[39].ownerNum = -1;

			purchaseProperty(player0, 39);

			assert.equal(player0.balance, 1100);
			assert.equal(game.places[39].ownerNum, 0);
			assert.deepEqual(player0.savedMessages, [
				["dialog", "Congratulations, player 0 name! You now own Boardwalk!"]
			]);
		});

		it("recognizes a monopoly", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[37].ownerNum = 0;
			game.places[39].ownerNum = -1;

			purchaseProperty(player0, 39);
			assert.equal(player0.balance, 1100);
			assert.equal(game.places[39].ownerNum, 0);
			assert.deepEqual(player0.savedMessages, [
				["dialog", "Congratulations, player 0 name! You now own Boardwalk!"],
				["dialog",  "Monopoly! You may now build houses on Park Place and Boardwalk, and their rents have doubled."]
			]);
		});
	});


	describe("#buyHouse()", () => {
		it("add a house to the property for the player", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[39].houseCount = 0;

			buyHouse(player0, 39);
			assert.equal(player0.balance, 1300);
			assert.equal(game.places[39].houseCount, 1);
			assert.deepEqual(player0.savedMessages, [
				["notify", "Built a house on Boardwalk."]
			]);
		});

		it("upgrades to a hotel if 4 houses", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[39].houseCount = 4;

			buyHouse(player0, 39);

			assert.equal(player0.balance, 1300);
			assert.equal(game.places[39].houseCount, 5);
			assert.deepEqual(player0.savedMessages, [
				["notify", "Upgraded to a hotel on Boardwalk."]
			]);
		});

		it("does not add a house if property is mortgaged", () => {
			const {game, player0, mockSocket0} = getFreshGame();

			buyHouse(player0, 37);

			assert.equal(player0.balance, 1500);
			assert.equal(game.places[37].houseCount, 0);
		});

		it("does not add a house if already a hotel", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[39].houseCount = 5;

			buyHouse(player0, 39);

			assert.equal(player0.balance, 1500);
			assert.equal(game.places[39].houseCount, 5);
		});
	});

	describe("#sellHouse()", () => {
		it("sells a house from the property", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[39].houseCount = 3;

			sellHouse(player0, 39);
			assert.equal(player0.balance, 1600);
			assert.equal(game.places[39].houseCount, 2);
			assert.deepEqual(player0.savedMessages, [
				["notify", "Removed a house from Boardwalk."]
			]);
		});

		it("downgrades from a hotel", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[39].houseCount = 5;

			sellHouse(player0, 39);
			assert.equal(player0.balance, 1600);
			assert.equal(game.places[39].houseCount, 4);
			assert.deepEqual(player0.savedMessages, [
				["notify", "Downgraded from a hotel on Boardwalk."]
			]);
		});

		it("does not sell if no houses", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[39].houseCount = 0;

			sellHouse(player0, 39);
			assert.equal(player0.balance, 1500);
			assert.equal(game.places[39].houseCount, 0);
		});
	});

	describe("#mortgageProperty()", () => {
		it("mortgages a property", () => {
			const {game, player0, mockSocket0} = getFreshGame();

			mortgageProperty(player0, 39);
			assert.equal(player0.balance, 1700);
			assert.equal(game.places[39].isMortgaged, true);
			assert.deepEqual(player0.savedMessages, [
				["notify", "Mortgaged Boardwalk for $200."]
			]);
		});
	});

	describe("#unmortgageProperty()", () => {
		it("unmortgages a property", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.places[39].isMortgaged = true;

			unmortgageProperty(player0, 39);
			assert.equal(player0.balance, 1300);
			assert.equal(game.places[39].isMortgaged, false);
			assert.deepEqual(player0.savedMessages, [
				["notify", "Unmortgaged Boardwalk for $200."]
			]);
		});
	});
});