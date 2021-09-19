const assert = require("assert");
const proxyquire = require("proxyquire");
const {Game, GameRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");


describe("Gameplay Event Handlers", () => {

	describe("#onGameplayConnection()", () => {

		// TODO: test game not found in Data (and MemStore), player not found in game. Test "start-up" never received.
		const gameLogicCalls = [];

		const {onGameplayConnection} = proxyquire("../../controllers/gameplay-event-handlers.js", {
			// Stub the game logic functions.
			"../game-logic/execute-turn.js": {
				advanceTurn() {gameLogicCalls.push(["advanceTurn", [...arguments]])},
				executeTurn() {gameLogicCalls.push(["executeTurn", [...arguments]])},
				respondToBuyOffer() {gameLogicCalls.push(["respondToBuyOffer", [...arguments]])},
				buyHouse() {gameLogicCalls.push(["buyHouse", [...arguments]])},
				sellHouse() {gameLogicCalls.push(["sellHouse", [...arguments]])},
				useGetOutOfJailFreeCard() {gameLogicCalls.push(["useGetOutOfJailFreeCard", [...arguments]])},
				payOutOfJail() {gameLogicCalls.push(["payOutOfJail", [...arguments]])},
				mortgageProperty() {gameLogicCalls.push(["mortgageProperty", [...arguments]])},
				unmortgageProperty() {gameLogicCalls.push(["unmortgageProperty", [...arguments]])}
			},

			// Plant a mock game.
			"../storage/data.js": {
				"games": {
					"my game id": new GameRecord("my game id", "my game name", "my admin id", [
						new PlayerRecord("my player name", "my user id", 0, "my player sprite")
					], [])
				}
			}
		});

		it("registers a socket callback to the proper game logic function for each gameplay client event", () => {
			const mockIo = {
				to: function (roomName) {this.roomName = roomName; return this}
			};
			const mockSocket = {
				registeredCallbacks: {},
				sentMessages: [],
				on: function (eventName, callback) {this.registeredCallbacks[eventName] = callback},
				join: function (roomName) {this.roomName = roomName},
				emit: function (eventName, message) {this.sentMessages.push([eventName, message])}
			};

			// Register the callbacks.
			onGameplayConnection(mockIo, mockSocket, "my user id");

			// Test each socket callback.
			// For start-up, the socket and broadcaster IO should join a room, and the player should have
			// their first socket configured, and a "start-up" event sending the game. The cached game
			// and player objects in the onGameplayConnection make it possible to test subsequent callbacks.
			// For testability, we return those objects here.
			const [player, game] = mockSocket.registeredCallbacks["start-up"]({gameId: "my game id"});
			assert.equal(mockSocket.roomName, "my game id");
			assert.equal(mockIo.roomName, "my game id");
			assert.deepEqual(mockSocket.sentMessages, [
				[
					"start-up",
					{
						"currentPlayerId": 0,
						"locationData": undefined,
						"monopolies": [],
						"numTurns": 0,
						"playerData": [
							{
								"balance": 1500,
								"jailDays": 0,
								"latestRoll": null,
								"name": "my player name",
								"num": 0,
								"numJailCards": 0,
								"placeIdx": 0,
								"rollCount": 0,
								"savedMessages": [],
								"spriteFileName": "my player sprite",
								"userId": "my user id"
							}
						],
						"tax": 0,
						"yourPlayerId": 0
					}
				]
			]);

			const actual = gameLogicCalls;

			mockSocket.registeredCallbacks["advance-turn"]();
			assert.deepEqual(actual.shift(), ["advanceTurn", [player, game]]);

			mockSocket.registeredCallbacks["execute-turn"]({playerId: 0});
			assert.deepEqual(actual.shift(), ["executeTurn", [player]]);

			mockSocket.registeredCallbacks["respond-to-buy-offer"]({playerId: 0, ifBuy: true});
			assert.deepEqual(actual.shift(), ["respondToBuyOffer", [player, true]]);

			mockSocket.registeredCallbacks["buy-house"]({playerId: 0, placeIdx: 5});
			assert.deepEqual(actual.shift(), ["buyHouse", [player, 5]]);

			mockSocket.registeredCallbacks["sell-house"]({playerId: 0, placeIdx: 10});
			assert.deepEqual(actual.shift(), ["sellHouse", [player, 10]]);

			mockSocket.registeredCallbacks["use-jail-card"]({playerId: 0});
			assert.deepEqual(actual.shift(), ["useGetOutOfJailFreeCard", [player]]);

			mockSocket.registeredCallbacks["pay-out-of-jail"]({playerId: 0});
			assert.deepEqual(actual.shift(), ["payOutOfJail", [player]]);

			mockSocket.registeredCallbacks["mortgage-property"]({playerId: 0, placeIdx: 15});
			assert.deepEqual(actual.shift(), ["mortgageProperty", [player, 15]]);

			mockSocket.registeredCallbacks["unmortgage-property"]({playerId: 0, placeIdx: 20});
			assert.deepEqual(actual.shift(), ["unmortgageProperty", [player, 20]]);

			// Test there are no other callback calls.
			assert.deepEqual(actual, []);
		});
	});
});
