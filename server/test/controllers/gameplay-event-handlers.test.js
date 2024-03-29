const assert = require("assert");
const proxyquire = require("proxyquire");
const {Game, GameRecord} = require("../../models/game.js");
const Mock = require("../test-utils/mock.js");
const {MockSocket} = require("../test-utils/mock-socket.js");
const {PlayerRecord} = require("../../models/player.js");


describe("Gameplay Event Handlers", () => {

	describe("#onGameplayConnection()", () => {

		let actualGameActionCalls = [];

		const playerRecords = Mock.playerRecords(["Mudkip"]);

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
			"../storage/lookup.js": {
				fetchGame(gameId) {
					const games = {
						"my-game-1-xyz": Mock.game("My Game 1", 0, playerRecords, [
							{placeIdx: 37, ownerNum: 0, houseCount: 0, isMortgaged: true},
							{placeIdx: 39, ownerNum: 0, houseCount: 2, isMortgaged: false}
						]),
						"my-game-2-xyz": Mock.game("My Game 2", 1, playerRecords)
					};
					return games[gameId];
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

		it("adds the socket to the room and locates the player and game on start-up, and removes the socket on disconnect", () => {
			actualGameActionCalls = [];
			const mockSocket = new MockSocket();

			// Register the callbacks.
			onGameplayConnection(mockSocket, "mudkip-xyz-0");

			// For start-up, the socket should join a room, and the player should have
			// their first socket configured, and a "start-up" event sending the game.
			const [player, game] = mockSocket.receive("start-up", {gameId: "my-game-1-xyz"});
			assert.equal(mockSocket.roomName, "my-game-1-xyz");
			assert.equal(game.id, "my-game-1-xyz");
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
								"num": 0,
								"name": "Mudkip",
								"spriteFileName": "Mudkip.png",
								"borderColor": "rgb(Mudkip)",
								"userId": "mudkip-xyz-0",
								"balance": 1500,
								"jailDays": 0,
								"latestRoll": null,
								"numJailCards": 0,
								"placeIdx": 0,
								"rollCount": 0,
								"savedMessages": []
							}
						],
						"tax": 0,
						"yourPlayerId": 0
					}
				]
			]);

			mockSocket.receive("disconnect");
			assert.deepEqual(player.sockets, []);
		});

		it("registers a socket callback to the proper game logic function for each gameplay client event", () => {
			actualGameActionCalls = [];
			const mockSocket = new MockSocket();

			// Register the callbacks.
			onGameplayConnection(mockSocket, "mudkip-xyz-0");

			// onGameplayConnection needs a "start-up" to find and cache the game and player objects in its closure,
			// in order for subsequent callbacks to work.
			const [player, game] = mockSocket.receive("start-up", {gameId: "my-game-1-xyz"});

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
				mockSocket.receive(clientEventName, clientArgs);
				const [actualEventName, actualGameActionArgs] = actualGameActionCalls.shift();

				assert.equal(actualEventName, clientEventName);
				assert.deepEqual(actualGameActionArgs, expectedResults[clientEventName]);
			});

			// Test there are no other calls to these callbacks.
			assert.deepEqual(actualGameActionCalls, []);

			mockSocket.receive("disconnect");

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
			const mockSocket = new MockSocket();

			onGameplayConnection(mockSocket, "unknown user id");
			const actual = mockSocket.receive("start-up", {gameId: "my-game-1-xyz"});

			assert.equal(actual, undefined);
		});

		it("quits out on start-up if the game is not found", () => {
			actualGameActionCalls = [];
			const mockSocket = new MockSocket();

			onGameplayConnection(mockSocket, "mudkip-xyz-0");
			const actual = mockSocket.receive("start-up", {gameId: "unknown game id"});

			assert.equal(actual, undefined);
		});

		it("cancels game actions that occur before start-up", () => {
			actualGameActionCalls = [];
			const mockSocket = new MockSocket();

			onGameplayConnection(mockSocket, "mudkip-xyz-0");

			[
				...expectedSocketEvents,
				{"clientEventName": "disconnect", "clientArgs": {}}
			].map(({clientEventName, clientArgs}) => mockSocket.receive(clientEventName, clientArgs));

			assert.deepEqual(actualGameActionCalls, []);
		});
	});
});
