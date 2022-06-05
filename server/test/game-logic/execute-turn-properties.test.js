const assert = require("assert");
const proxyquire = require("proxyquire");
const {Game, GameRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");
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

	class MockSocket {
		constructor() {
			this.messages = [];
		}

		emit(message, data) {
			this.messages.push([message, data]);
		}

		resetMock() {
			this.messages = [];
		}
	}

	function getFreshGame() {
		const game = new Game(new GameRecord("my game id", "my game name", "my admin id", [
			new PlayerRecord("player 0 name", "user id 0", 0, "player sprite 0"),
			new PlayerRecord("player 1 name", "user id 1", 1, "player sprite 1"),
			new PlayerRecord("player 2 name", "user id 2", 2, "player sprite 2")
		], [
			{placeIdx: 37, ownerNum: 0, houseCount: 0, isMortgaged: true},
			{placeIdx: 39, ownerNum: 0, houseCount: 2, isMortgaged: false}
		]));

		game.currentPlayerId = 0;

		const player0 = game.players[0];
		const mockSocket0 = new MockSocket();
		player0.configureEmitter(null, mockSocket0);

		return {
			game,
			player0,
			mockSocket0
		};
	}

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
});