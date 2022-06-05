const assert = require("assert");
const proxyquire = require("proxyquire");
const {Game, GameRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");
const {Utilities} = require("../../game-logic/location-configs.js");


describe("Execute Turn: Other", () => {

	let obeyLocationCalls = 0;
	const {
		payOutOfJail,
		useGetOutOfJailFreeCard,
		hasAchievedColoredMonopoly,
		concatenatePropertyNames
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

	describe("#payOutOfJail()", () => {
		it("releases the player from jail", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.jailDays = 3;

			payOutOfJail(player0);

			assert.equal(player0.jailDays, 0);
			assert.equal(player0.balance, 1450);
			assert.deepEqual(player0.savedMessages, [
				["dialog", "You are now out of jail!"],
				["allow-conclude-turn", undefined]
			]);
		});
	});

	describe("#useGetOutOfJailFreeCard()", () => {
		it("releases the player from jail", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.jailDays = 3;
			player0.numJailCards = 1;

			useGetOutOfJailFreeCard(player0);

			assert.equal(player0.jailDays, 0);
			assert.equal(player0.numJailCards, 0);
			assert.deepEqual(player0.savedMessages, [
				["dialog", "You are now out of jail!"]
			]);
		});

		it("ignores if the player does not have jail cards", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.jailDays = 3;
			player0.numJailCards = 0;

			useGetOutOfJailFreeCard(player0);

			assert.equal(player0.jailDays, 3);
		});

		it("ignores if the player is not in jail", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.jailDays = 0;
			player0.numJailCards = 1;

			useGetOutOfJailFreeCard(player0);

			assert.equal(player0.numJailCards, 1);
		});
	});

	describe("#concatenatePropertyNames()", () => {
		it("formats 2 property names", () => {
			const actual = concatenatePropertyNames(["A", "B"]);
			assert.equal(actual, "A and B");
		});
		it("formats 3 property names", () => {
			const actual = concatenatePropertyNames(["A", "B", "C"]);
			assert.equal(actual, "A, B, and C");
		});
	});

	describe("#hasAchievedColoredMonopoly()", () => {
		const {game, player0, mockSocket0} = getFreshGame();
		[1, 3, 6, 8, 9, 12, 28].forEach(placeIdx => game.places[placeIdx].ownerNum = 0);

		it("identifies a 2-residence monopoly", () => {
			assert.equal(hasAchievedColoredMonopoly([1, 3], player0), true);
		});

		it("identifies a 3-residence monopoly", () => {
			assert.equal(hasAchievedColoredMonopoly([6, 8, 9], player0), true);
		});

		it("rejects a 3-residence monopoly", () => {
			assert.equal(hasAchievedColoredMonopoly([11, 13, 14], player0), false);
		});

		it("ignores a non-residential monopoly", () => {
			assert.equal(hasAchievedColoredMonopoly(Utilities, player0), false);
		});

		it("gracefully handles places that aren't in any monopoly", () => {
			assert.equal(hasAchievedColoredMonopoly(undefined, player0), false);
		});
	});

});