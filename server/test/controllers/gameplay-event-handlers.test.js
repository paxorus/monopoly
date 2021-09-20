const assert = require("assert");
const proxyquire = require("proxyquire");
const {Game, GameRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");


describe("Gameplay Event Handlers", () => {

	describe("#onGameplayConnection()", () => {

		// TODO: test game not found in Data (and MemStore), player not found in game. Test "start-up" never received.
		let actualGameActionCalls = [];

		const {onGameplayConnection} = proxyquire("../../controllers/gameplay-event-handlers.js", {
			// Stub the game logic functions.
			"../game-logic/execute-turn.js": {
				advanceTurn() {actualGameActionCalls.push(["advance-turn", [...arguments]])},
				executeTurn() {actualGameActionCalls.push(["execute-turn", [...arguments]])},
				respondToBuyOffer() {actualGameActionCalls.push(["respond-to-buy-offer", [...arguments]])},
				buyHouse() {actualGameActionCalls.push(["buy-house", [...arguments]])},
				sellHouse() {actualGameActionCalls.push(["sell-house", [...arguments]])},
				useGetOutOfJailFreeCard() {actualGameActionCalls.push(["use-jail-card", [...arguments]])},
				payOutOfJail() {actualGameActionCalls.push(["pay-out-of-jail", [...arguments]])},
				mortgageProperty() {actualGameActionCalls.push(["mortgage-property", [...arguments]])},
				unmortgageProperty() {actualGameActionCalls.push(["unmortgage-property", [...arguments]])}
			},

			// Plant a mock game.
			"../storage/data.js": {
				"games": {
					"my game id": new GameRecord("my game id", "my game name", "my admin id", [
						new PlayerRecord("my player name", "my user id", 0, "my player sprite")
					], [
						{placeIdx: 37, ownerNum: 0, houseCount: 0, isMortgaged: true},
						{placeIdx: 39, ownerNum: 0, houseCount: 2, isMortgaged: false}
					])
				}
			}
		});

		const mockIo = {
			to: function (roomName) {this.roomName = roomName; return this},
			resetMock: function () {delete this.roomName}
		};

		const mockSocket = {
			registeredCallbacks: {},
			sentMessages: [],
			on: function (eventName, callback) {this.registeredCallbacks[eventName] = callback},
			join: function (roomName) {this.roomName = roomName},
			emit: function (eventName, message) {this.sentMessages.push([eventName, message])},
			resetMock: function () {
				this.registeredCallbacks = [];
				this.sentMessages = [];
				delete this.roomName;
			}
		};

		it("adds the socket to the room and locates the player and game on start-up, and removes the socket on disconnect", () => {
			actualGameActionCalls = [];
			mockIo.resetMock();
			mockSocket.resetMock();

			// Register the callbacks.
			onGameplayConnection(mockIo, mockSocket, "my user id");

			// For start-up, the socket and broadcaster IO should join a room, and the player should have
			// their first socket configured, and a "start-up" event sending the game.
			const [player, game] = mockSocket.registeredCallbacks["start-up"]({gameId: "my game id"});
			assert.equal(mockSocket.roomName, "my game id");
			assert.equal(mockIo.roomName, "my game id");
			assert.equal(game.id, "my game id");
			assert.deepEqual(player.sockets, [mockSocket]);

			assert.equal(mockSocket.sentMessages[0][1].locationData.length, 28);
			delete mockSocket.sentMessages[0][1].locationData;
			assert.deepEqual(mockSocket.sentMessages, [
				[
					"start-up",
					{
						"currentPlayerId": 0,
						"monopolies": [[37, 39]],
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

			mockSocket.registeredCallbacks["disconnect"]();
			assert.deepEqual(player.sockets, []);
		});

		it("registers a socket callback to the proper game logic function for each gameplay client event", () => {
			actualGameActionCalls = [];
			mockIo.resetMock();
			mockSocket.resetMock();

			// Register the callbacks.
			onGameplayConnection(mockIo, mockSocket, "my user id");

			// onGameplayConnection needs a "start-up" to find and cache the game and player objects in its closure,
			// in order for subsequent callbacks to work.
			const [player, game] = mockSocket.registeredCallbacks["start-up"]({gameId: "my game id"});

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
				assert.deepEqual(actualGameActionCalls.shift(), [clientEventName, gameActionArgs]);
			});

			// Test there are no other calls to these callbacks.
			assert.deepEqual(actualGameActionCalls, []);

			mockSocket.registeredCallbacks["disconnect"]();

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
