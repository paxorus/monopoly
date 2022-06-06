const assert = require("assert");
const {PlayerRecord, Player} = require("../../models/player.js");
const {MockSocket} = require("../test-utils/mock-socket.js");


describe("PlayerRecord", () => {
	describe("#constructor()", () => {
		it("builds", () => {
			const actual = new PlayerRecord("my name", "my id", 0, "my image", "my sprite color");

			assert.deepEqual(actual, {
				"balance": 1500,
				"jailDays": 0,
				"latestRoll": null,
				"name": "my name",
				"num": 0,
				"numJailCards": 0,
				"placeIdx": 0,
				"rollCount": 0,
				"savedMessages": [],
				"spriteFileName": "my image",
				"borderColor": "my sprite color",
				"userId": "my id"
			});
		});
	});
});

describe("Player", () => {

	describe("#addSocket(), removeSocket()", () => {
		it("accepts multiple sockets for a player", () => {
			const mockSocket = new MockSocket();
			const mockSocket2 = new MockSocket();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});
			assert.deepEqual(player.sockets, []);

			player.addSocket(mockSocket);
			assert.deepEqual(player.sockets, [mockSocket]);

			player.addSocket(mockSocket2);
			assert.deepEqual(player.sockets, [mockSocket, mockSocket2]);

			player.removeSocket(mockSocket2);
			assert.deepEqual(player.sockets, [mockSocket]);

			player.removeSocket(mockSocket);
			assert.deepEqual(player.sockets, []);
		});
	});

	describe("#emit()", () => {
		it("emits to all of the player's online clients", () => {
			const mockSocket = new MockSocket();
			const mockSocket2 = new MockSocket();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});

			player.addSocket(mockSocket);
			player.addSocket(mockSocket2);
			player.emit("boop", {x: 10});

			assert.deepEqual(mockSocket.sentMessages, [
				["boop", {x: 10}]
			]);
			assert.deepEqual(mockSocket2.sentMessages, [
				["boop", {x: 10}]
			]);
		});

		it("does not emit if the player goes offline", () => {
			const mockSocket = new MockSocket();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});

			player.addSocket(mockSocket);
			player.emit("boop", {x: 10});

			player.removeSocket(mockSocket);
			player.emit("offline-event", {z: 15});

			assert.deepEqual(mockSocket.sentMessages, [
				["boop", {x: 10}]
			]);
		});

		it("saves messages that impact the state of the message box", () => {
			const mockSocket = new MockSocket();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});

			player.addSocket(mockSocket);
			player.emit("allow-conclude-turn", {});
			player.emit("offer-pay-out-of-jail", {});
			player.emit("offer-unowned-property", {});
			player.emit("dialog", {});
			player.emit("notify", {});
			player.emit("advance-turn", {nextPlayerId: 1});

			assert.deepEqual(player.savedMessages, [
				["allow-conclude-turn", {}],
				["offer-pay-out-of-jail", {}],
				["offer-unowned-property", {}],
				["dialog", {}],
				["notify", {}],
				["advance-turn", {nextPlayerId: 1}]
			]);

			player.emit("advance-turn", {nextPlayerId: 0});
			assert.deepEqual(player.savedMessages, [
				["advance-turn", {nextPlayerId: 0}]
			]);
		});
	});

	describe("#emitToEveryone()", () => {
		it("emits to all players properly", () => {
			const mockSocket = new MockSocket();
			const mockSocket2 = new MockSocket();

			const mockGame = {};
			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), mockGame);
			const player2 = new Player(new PlayerRecord("their name", "their id", 1, "their image"), mockGame);
			mockGame.players = [player, player2];

			player.addSocket(mockSocket);
			player2.addSocket(mockSocket2);

			player.emit("boop", {x: 10});
			player.emitToEveryone("troop", {y: 20});

			assert.deepEqual(mockSocket.sentMessages, [
				["boop", {x: 10}],
				["troop", {y: 20}]
			]);

			assert.deepEqual(mockSocket2.sentMessages, [
				["troop", {y: 20}]
			]);
		});
	});

	describe("#goToJail(), decrementJailDays(), getOutOfJail()", () => {
		it("performs jail time for a user", () => {
			const mockSocket = new MockSocket();

			const mockGame = {};
			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), mockGame);
			mockGame.players = [player];
			player.addSocket(mockSocket);

			player.savedMessages = [];
			player.goToJail();
			assert.equal(player.jailDays, 3);
			assert.equal(player.placeIdx, 10);
			assert.deepEqual(player.savedMessages, [["dialog", "You will be in jail for 3 turns!"]]);
			assert.deepEqual(mockSocket.sentMessages, [
				["dialog", "You will be in jail for 3 turns!"],
				["update-location", {placeIdx: 10, playerId: 0}],
				["go-to-jail", {playerId: 0}]
			]);

			mockSocket.clear();
			player.savedMessages = [];
			player.decrementJailDays();
			assert.equal(player.jailDays, 2);
			assert.deepEqual(player.savedMessages, []);

			player.savedMessages = [];
			player.getOutOfJail();
			assert.equal(player.jailDays, 0);
			assert.deepEqual(player.savedMessages, [["dialog", "You are now out of jail!"]]);
			assert.deepEqual(mockSocket.sentMessages, [
				["update-jail-days", {jailDays: 2, playerId: 0}],
				["dialog", "You are now out of jail!"],
				["get-out-of-jail", {playerId: 0}]
			]);
		});
	});

	describe("#updateBalance()", () => {
		it("increments the balance for all users", () => {
			const mockSocket = new MockSocket();

			const mockGame = {};
			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), mockGame);
			mockGame.players = [player];
			player.addSocket(mockSocket);

			player.updateBalance(3);
			assert.equal(player.balance, 1503);
			assert.deepEqual(mockSocket.sentMessages, [
				["update-balance", {balance: 1503, playerId: 0}]
			]);
		});
	});

	describe("#updateLocation()", () => {
		it("updates the location for all users", () => {
			const mockSocket = new MockSocket();

			const mockGame = {};
			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), mockGame);
			mockGame.players = [player];
			player.addSocket(mockSocket);

			player.updateLocation(50);
			assert.equal(player.placeIdx, 50);
			assert.deepEqual(mockSocket.sentMessages, [
				["update-location", {placeIdx: 50, playerId: 0}]
			]);
		});
	});

	describe("#serialize()", () => {
		it("serializes the player back into a record", () => {
			const playerRecord = new PlayerRecord("my name", "my id", 0, "my image")
			// The mock game and socket should get removed.
			const player = new Player(playerRecord, {});
			player.addSocket(new MockSocket());

			const actual = player.serialize();
			assert.deepEqual(playerRecord, actual);
		});
	});
});
