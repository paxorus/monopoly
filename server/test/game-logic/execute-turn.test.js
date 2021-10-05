const assert = require("assert");
const proxyquire = require("proxyquire");
const RandomInt = require("../../fickle/random-int.js");
const TimeNow = require("../../fickle/time-now.js");
const {Game, GameRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");


describe("Execute Turn", () => {

	let obeyLocationCalls = 0;
	const {
		rollDice,
		concludeTurn,
		advanceTurn,
		executeTurn,
		// payOutOfJail,
		// respondToBuyOffer,
		// purchaseProperty,
		// hasAchievedColoredMonopoly,
		// concatenatePropertyNames,
		// buyHouse,
		// sellHouse,
		// useGetOutOfJailFreeCard,
		// mortgageProperty,
		// unmortgageProperty
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

	describe("#concludeTurn()", () => {
		it("emits the correct message", () => {
			const mover = {
				messages: [],
				emit: function (message) {this.messages.push(message)}
			};
			concludeTurn(mover);

			assert.deepEqual(mover.messages, ["allow-conclude-turn"]);
		});
	});

	describe("#advanceTurn()", () => {
		it("rotates from the last to the first player and counts the turn", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			game.currentPlayerId = 2;
			game.numTurns += 5;

			const player1 = game.players[1];
			const mockSocket1 = new MockSocket();
			player1.configureEmitter(null, mockSocket1);

			TimeNow._inject(1.6e12);
			advanceTurn(player0, game);

			assert.equal(game.currentPlayerId, 0);
			assert.equal(game.numTurns, 6);
			assert.equal(game.lastUpdateTime, 1.6e12);

			// Also check that player received the message.
			assert.deepEqual(player0.savedMessages, [
				["advance-turn", {nextPlayerId: 0}]
			]);
			assert.deepEqual(mockSocket0.messages, [
				["advance-turn", {nextPlayerId: 0}]
			]);

			// Also check another player received the message.
			assert.deepEqual(player1.savedMessages, [
				["advance-turn", {nextPlayerId: 0}]
			]);
			assert.deepEqual(mockSocket1.messages, [
				["advance-turn", {nextPlayerId: 0}]
			]);
		});
	});

	describe("#executeTurn()", () => {
		it("rotates from the last to the first player and counts the turn", () => {
			const {game, player0, mockSocket0} = getFreshGame();

			RandomInt._inject(2, 6);
			obeyLocationCalls = 0;

			executeTurn(player0);

			assert.deepEqual(player0.latestRoll, [2, 6]);
			assert.deepEqual(player0.rollCount, 1);
			assert.deepEqual(player0.placeIdx, 8);
			assert.deepEqual(obeyLocationCalls, 1);

			assert.deepEqual(mockSocket0.messages, [
				["log", "You rolled a 2 and a 6."],
				["log", "You landed on Vermont Avenue."],
				["allow-conclude-turn", undefined]
			]);
		});

		it("goes twice on a double", () => {
			const {game, player0, mockSocket0} = getFreshGame();

			RandomInt._inject(3, 3, 5, 6);
			obeyLocationCalls = 0;

			executeTurn(player0);

			assert.deepEqual(player0.latestRoll, [5, 6]);
			assert.deepEqual(player0.rollCount, 2);
			assert.deepEqual(player0.placeIdx, 17);
			assert.deepEqual(obeyLocationCalls, 2);

			assert.deepEqual(mockSocket0.messages, [
				["log", "You rolled a 3 and a 3."],
				["log", "You landed on Oriental Avenue."],
				["log", "A double!"],
				["log", "You rolled a 5 and a 6."],
				["log", "You landed on Community Chest."],
				["allow-conclude-turn", undefined]
			]);
		});

		it("sends the player to jail on the third double", () => {
			const {game, player0, mockSocket0} = getFreshGame();

			RandomInt._inject(3, 3, 5, 5, 2, 2);
			obeyLocationCalls = 0;

			executeTurn(player0);

			assert.deepEqual(player0.latestRoll, [2, 2]);
			assert.deepEqual(player0.rollCount, 3);
			assert.deepEqual(player0.placeIdx, 10);
			assert.deepEqual(obeyLocationCalls, 3);

			assert.deepEqual(mockSocket0.messages, [
				["log", "You rolled a 3 and a 3."],
				["log", "You landed on Oriental Avenue."],
				["log", "A double!"],
				["log", "You rolled a 5 and a 5."],
				["log", "You landed on St. James Place."],
				["log", "A double!"],
				["log", "You rolled a 2 and a 2."],
				["log", "You landed on Free Parking."],
				["log", "A 3rd double! Troll alert! You're going to jail."],
				["log", "You will be in jail for 3 turns!"],
				["allow-conclude-turn", undefined]
			]);
		});

		it("lets a jailed player leave if they roll a double", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.jailDays = 2;
			player0.placeIdx = 10;

			RandomInt._inject(3, 3);
			obeyLocationCalls = 0;

			executeTurn(player0);

			assert.deepEqual(player0.rollCount, 0);
			assert.deepEqual(player0.placeIdx, 10);
			assert.deepEqual(player0.jailDays, 0);
			assert.deepEqual(obeyLocationCalls, 0);

			assert.deepEqual(mockSocket0.messages, [
				["log", "You rolled a 3 and a 3."],
				["log", "A double! You're free!"],
				["log", "You are now out of jail!"],
				["allow-conclude-turn", undefined]
			]);
		});

		it("lets a jailed player leave if they serve their sentence", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.jailDays = 1;
			player0.placeIdx = 10;

			RandomInt._inject(3, 4);
			obeyLocationCalls = 0;

			executeTurn(player0);

			assert.deepEqual(player0.rollCount, 0);
			assert.deepEqual(player0.placeIdx, 10);
			assert.deepEqual(player0.jailDays, 0);
			assert.deepEqual(obeyLocationCalls, 0);

			assert.deepEqual(mockSocket0.messages, [
				["log", "You are now out of jail!"],
				["log", "Your jail sentence is up. You're free to go!"],
				["allow-conclude-turn", undefined]
			]);
		});

		it("offers a jailed player if they don't roll a double", () => {
			const {game, player0, mockSocket0} = getFreshGame();
			player0.jailDays = 2;
			player0.placeIdx = 10;

			RandomInt._inject(3, 4);
			obeyLocationCalls = 0;

			executeTurn(player0);

			assert.deepEqual(player0.rollCount, 0);
			assert.deepEqual(player0.placeIdx, 10);
			assert.deepEqual(obeyLocationCalls, 0);

			assert.deepEqual(mockSocket0.messages, [
				["log", "You rolled a 3 and a 4."],
				["offer-pay-out-of-jail", undefined]
			]);
		});
	});
});