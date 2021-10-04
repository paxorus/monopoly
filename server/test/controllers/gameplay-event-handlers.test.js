const assert = require("assert");
const proxyquire = require("proxyquire");
const {Game, GameRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");


describe("Gameplay Event Handlers", () => {

	describe("#onGameplayConnection()", () => {

		let actualGameActionCalls = [];

		const dummyPlayerRecords = [new PlayerRecord("my player name", "my user id", 0, "my player sprite")];

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
					"my game id": new GameRecord("my game id", "my game name", "my admin id", dummyPlayerRecords, [
						{placeIdx: 37, ownerNum: 0, houseCount: 0, isMortgaged: true},
						{placeIdx: 39, ownerNum: 0, houseCount: 2, isMortgaged: false}
					]),
					"my game id 2": new GameRecord("my game id 2", "this copy is in Data", "my admin id", dummyPlayerRecords, [])
				}
			},

			"../storage/in-memory-store.js": {
				"games": {
					"my game id 2": new Game(new GameRecord(
						"my game id 2", "this copy is in mem-store", "my admin id", dummyPlayerRecords, []
					))
				}				
			}
		});

		const expectedSocketEvents = [
			{
				"clientEventName": "advance-turn",
				"clientArgs": {}
			},
			{
				"clientEventName": "execute-turn",
				"clientArgs": {playerId: 0}
			},
			{
				"clientEventName": "respond-to-buy-offer",
				"clientArgs": {playerId: 0, ifBuy: true}
			},
			{
				"clientEventName": "buy-house",
				"clientArgs": {playerId: 0, placeIdx: 5}
			},
			{
				"clientEventName": "sell-house",
				"clientArgs": {playerId: 0, placeIdx: 10}
			},
			{
				"clientEventName": "use-jail-card",
				"clientArgs": {playerId: 0}
			},
			{
				"clientEventName": "pay-out-of-jail",
				"clientArgs": {playerId: 0}
			},
			{
				"clientEventName": "mortgage-property",
				"clientArgs": {playerId: 0, placeIdx: 15}
			},
			{
				"clientEventName": "unmortgage-property",
				"clientArgs": {playerId: 0, placeIdx: 20}
			}
		];

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
			const expectedResults = {
				"advance-turn": [player, game],
				"execute-turn": [player],
				"respond-to-buy-offer": [player, true],
				"buy-house": [player, 5],
				"sell-house": [player, 10],
				"use-jail-card": [player],
				"pay-out-of-jail": [player],
				"mortgage-property": [player, 15],
				"unmortgage-property": [player, 20]
			};

			expectedSocketEvents.forEach(({clientEventName, clientArgs}) => {
				mockSocket.registeredCallbacks[clientEventName](clientArgs);
				const [actualEventName, actualGameActionArgs] = actualGameActionCalls.shift();

				assert.equal(actualEventName, clientEventName);
				assert.deepEqual(actualGameActionArgs, expectedResults[clientEventName]);
			});

			// Test there are no other calls to these callbacks.
			assert.deepEqual(actualGameActionCalls, []);

			mockSocket.registeredCallbacks["disconnect"]();

			// Test there are no other registered event handlers on the socket.
			const actualRegisteredEventNames = new Set(Object.keys(mockSocket.registeredCallbacks));
			assert.deepEqual(actualRegisteredEventNames, new Set([
				"start-up",
				...Object.keys(expectedResults),
				"disconnect"
			]));
		});

		it("quits out on start-up if the user ID is not among the game's players", () => {
			actualGameActionCalls = [];
			mockIo.resetMock();
			mockSocket.resetMock();

			onGameplayConnection(mockIo, mockSocket, "unknown user id");
			const actual = mockSocket.registeredCallbacks["start-up"]({gameId: "my game id"});

			assert.equal(actual, undefined);
		});

		it("quits out on start-up if the game is not in Data or MemStore", () => {
			actualGameActionCalls = [];
			mockIo.resetMock();
			mockSocket.resetMock();

			onGameplayConnection(mockIo, mockSocket, "my user id");
			const actual = mockSocket.registeredCallbacks["start-up"]({gameId: "unknown game id"});

			assert.equal(actual, undefined);
		});

		it("prefers to fetch the game from MemStore over Data", () => {
			actualGameActionCalls = [];
			mockIo.resetMock();
			mockSocket.resetMock();

			onGameplayConnection(mockIo, mockSocket, "my user id");
			const [player, game] = mockSocket.registeredCallbacks["start-up"]({gameId: "my game id 2"});

			assert.equal(player.userId, "my user id");
			assert.equal(game.id, "my game id 2");
			assert.equal(game.name, "this copy is in mem-store");
		});

		it("cancels game actions that occur before start-up", () => {
			actualGameActionCalls = [];
			mockIo.resetMock();
			mockSocket.resetMock();

			onGameplayConnection(mockIo, mockSocket, "my user id");

			[
				...expectedSocketEvents,
				{"clientEventName": "disconnect", "clientArgs": {}}
			].map(({clientEventName, clientArgs}) => mockSocket.registeredCallbacks[clientEventName](clientArgs));

			assert.deepEqual(actualGameActionCalls, []);
		});
	});
});
