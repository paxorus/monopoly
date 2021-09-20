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
				advanceTurn() {gameLogicCalls.push(["advance-turn", [...arguments]])},
				executeTurn() {gameLogicCalls.push(["execute-turn", [...arguments]])},
				respondToBuyOffer() {gameLogicCalls.push(["respond-to-buy-offer", [...arguments]])},
				buyHouse() {gameLogicCalls.push(["buy-house", [...arguments]])},
				sellHouse() {gameLogicCalls.push(["sell-house", [...arguments]])},
				useGetOutOfJailFreeCard() {gameLogicCalls.push(["use-jail-card", [...arguments]])},
				payOutOfJail() {gameLogicCalls.push(["pay-out-of-jail", [...arguments]])},
				mortgageProperty() {gameLogicCalls.push(["mortgage-property", [...arguments]])},
				unmortgageProperty() {gameLogicCalls.push(["unmortgage-property", [...arguments]])}
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

			// For start-up, the socket and broadcaster IO should join a room, and the player should have
			// their first socket configured, and a "start-up" event sending the game. The cached game
			// and player objects in the onGameplayConnection make it possible to test subsequent callbacks.
			// For testability, we return those objects here.
			const [player, game] = mockSocket.registeredCallbacks["start-up"]({gameId: "my game id"});
			assert.equal(mockSocket.roomName, "my game id");
			assert.equal(mockIo.roomName, "my game id");
			assert.deepEqual(player.sockets, [mockSocket]);
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

			// Test each socket callback.
			const expectedSocketEvents = [
				{
					"clientEventName": "advance-turn",
					"clientArgs": {},
					"gameActionArgs": [player, game]
				},
				{
					"clientEventName": "execute-turn",
					"clientArgs": {playerId: 0},
					"gameActionArgs": [player]
				},
				{
					"clientEventName": "respond-to-buy-offer",
					"clientArgs": {playerId: 0, ifBuy: true},
					"gameActionArgs": [player, true]
				},
				{
					"clientEventName": "buy-house",
					"clientArgs": {playerId: 0, placeIdx: 5},
					"gameActionArgs": [player, 5]
				},
				{
					"clientEventName": "sell-house",
					"clientArgs": {playerId: 0, placeIdx: 10},
					"gameActionArgs": [player, 10]
				},
				{
					"clientEventName": "use-jail-card",
					"clientArgs": {playerId: 0},
					"gameActionArgs": [player]
				},
				{
					"clientEventName": "pay-out-of-jail",
					"clientArgs": {playerId: 0},
					"gameActionArgs": [player]
				},
				{
					"clientEventName": "mortgage-property",
					"clientArgs": {playerId: 0, placeIdx: 15},
					"gameActionArgs": [player, 15]
				},
				{
					"clientEventName": "unmortgage-property",
					"clientArgs": {playerId: 0, placeIdx: 20},
					"gameActionArgs": [player, 20]
				}
			];

			expectedSocketEvents.forEach(({clientEventName, clientArgs, gameActionArgs}) => {
				mockSocket.registeredCallbacks[clientEventName](clientArgs);
				assert.deepEqual(actual.shift(), [clientEventName, gameActionArgs]);
			});

			// Test there are no other calls to these callbacks.
			assert.deepEqual(actual, []);

			mockSocket.registeredCallbacks["disconnect"]();
			assert.deepEqual(player.sockets, []);

			// Test there are no other registered event handlers on the socket.
			const actualRegisteredEventNames = new Set(Object.keys(mockSocket.registeredCallbacks));
			const expectedEventNames = new Set([
				"start-up",
				...expectedSocketEvents.map(({clientEventName}) => clientEventName),
				"disconnect"
			]);
			assert.deepEqual(actualRegisteredEventNames, expectedEventNames);
		});
	});
});
