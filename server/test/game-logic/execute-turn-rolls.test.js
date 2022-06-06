const assert = require("assert");
const proxyquire = require("proxyquire");
const RandomInt = require("../../fickle/random-int.js");
const TimeNow = require("../../fickle/time-now.js");
const {getFreshGame} = require("../test-utils/execute-turn-utils.js");
const {MockSocket} = require("../test-utils/mock-socket.js");


describe("Execute Turn: Rolls", () => {

	let obeyLocationCalls = 0;
	const {
		rollDice,
		concludeTurn,
		advanceTurn,
		executeTurn
	} = proxyquire("../../game-logic/execute-turn.js", {
		// Mock out obeyLocation, which is tested separately.
		"./obey-location.js": { obeyLocation() { obeyLocationCalls ++; }}
	});

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
			player1.addSocket(mockSocket1);

			TimeNow._inject(1.6e12);
			advanceTurn(player0, game);

			assert.equal(game.currentPlayerId, 0);
			assert.equal(game.numTurns, 6);
			assert.equal(game.lastUpdateTime, 1.6e12);

			// Also check that player received the message.
			assert.deepEqual(player0.savedMessages, [
				["advance-turn", {nextPlayerId: 0}]
			]);
			assert.deepEqual(mockSocket0.sentMessages, [
				["advance-turn", {nextPlayerId: 0}]
			]);

			// Also check another player received the message.
			assert.deepEqual(player1.savedMessages, [
				["advance-turn", {nextPlayerId: 0}]
			]);
			assert.deepEqual(mockSocket1.sentMessages, [
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

			assert.deepEqual(mockSocket0.sentMessages, [
				["dialog", "You rolled a 2 and a 6."],
				["update-location", {placeIdx: 8, playerId: 0}],
				["dialog", "You landed on Vermont Avenue."],
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

			assert.deepEqual(mockSocket0.sentMessages, [
				["dialog", "You rolled a 3 and a 3."],
				["update-location", {placeIdx: 6, playerId: 0}],
				["dialog", "You landed on Oriental Avenue."],
				["dialog", "A double!"],
				["dialog", "You rolled a 5 and a 6."],
				["update-location", {placeIdx: 17, playerId: 0}],
				["dialog", "You landed on Community Chest."],
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

			assert.deepEqual(mockSocket0.sentMessages, [
				["dialog", "You rolled a 3 and a 3."],
				["update-location", {placeIdx: 6, playerId: 0}],
				["dialog", "You landed on Oriental Avenue."],
				["dialog", "A double!"],
				["dialog", "You rolled a 5 and a 5."],
				["update-location", {placeIdx: 16, playerId: 0}],
				["dialog", "You landed on St. James Place."],
				["dialog", "A double!"],
				["dialog", "You rolled a 2 and a 2."],
				["update-location", {placeIdx: 20, playerId: 0}],
				["dialog", "You landed on Free Parking."],
				["dialog", "A 3rd double! Troll alert! You're going to jail."],
				["dialog", "You will be in jail for 3 turns!"],
				["update-location", {placeIdx: 10, playerId: 0}],
				["go-to-jail", {playerId: 0}],
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

			assert.deepEqual(mockSocket0.sentMessages, [
				["update-jail-days", {jailDays: 1, playerId: 0}],
				["dialog", "You rolled a 3 and a 3."],
				["dialog", "A double! You're free!"],
				["dialog", "You are now out of jail!"],
				["get-out-of-jail", {playerId: 0}],
				["allow-conclude-turn", undefined]
			]);
		});

		it("lets a jailed player leave if they complete their sentence", () => {
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

			assert.deepEqual(mockSocket0.sentMessages, [
				["update-jail-days", {jailDays: 0, playerId: 0}],
				["dialog", "You are now out of jail!"],
				["get-out-of-jail", {playerId: 0}],
				["dialog", "Your jail sentence is up. You're free to go!"],
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

			assert.deepEqual(mockSocket0.sentMessages, [
				["update-jail-days", {jailDays: 1, playerId: 0}],
				["dialog", "You rolled a 3 and a 4."],
				["offer-pay-out-of-jail", undefined]
			]);
		});
	});
});