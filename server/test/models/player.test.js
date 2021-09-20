const assert = require("assert");
const {PlayerRecord, Player} = require("../../models/player.js");


describe("PlayerRecord", () => {
	describe("#constructor()", () => {
		it("builds", () => {
			const actual = new PlayerRecord("my name", "my id", 0, "my image");

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
				"userId": "my id"
			});
		});
	});
});

describe("Player", () => {

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

	const mockSocket = new MockSocket();
	const mockSocket2 = new MockSocket();

	const mockIo = {
		messages: [],
		emit: function (message, data) {this.messages.push([message, data])},
		resetMock: function () {this.messages = []}
	};

	describe("#configureEmitter(), removeEmitter()", () => {
		it("accepts multiple sockets for a player", () => {
			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});
			assert.deepEqual(player.sockets, []);

			player.configureEmitter(null, mockSocket);
			assert.deepEqual(player.sockets, [mockSocket]);

			player.configureEmitter(null, mockSocket2);
			assert.deepEqual(player.sockets, [mockSocket, mockSocket2]);

			player.removeEmitter(mockSocket2);
			assert.deepEqual(player.sockets, [mockSocket]);

			player.removeEmitter(mockSocket);
			assert.deepEqual(player.sockets, []);
		});
	});

	describe("#emit()", () => {
		it("emits to all of the player's online clients", () => {
			mockSocket.resetMock();
			mockSocket2.resetMock();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});

			player.configureEmitter(null, mockSocket);
			player.configureEmitter(null, mockSocket2);
			player.emit("boop", {x: 10});

			assert.deepEqual(mockSocket.messages, [
				["boop", {x: 10}]
			]);
			assert.deepEqual(mockSocket2.messages, [
				["boop", {x: 10}]
			]);
		});

		it("does not emit if the player goes offline", () => {
			mockSocket.resetMock();

			const mockGame = {};
			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});

			player.configureEmitter(null, mockSocket);
			player.emit("boop", {x: 10});

			player.removeEmitter(mockSocket);
			player.emit("offline-event", {z: 15});

			assert.deepEqual(mockSocket.messages, [
				["boop", {x: 10}]
			]);
		});
	});

	describe("#emitToAll()", () => {
		it("emits to all players properly", () => {
			mockSocket.resetMock();
			mockSocket2.resetMock();

			const mockGame = {};
			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), mockGame);
			const player2 = new Player(new PlayerRecord("their name", "their id", 1, "their image"), mockGame);
			mockGame.players = [player, player2];

			player.configureEmitter(null, mockSocket);
			player2.configureEmitter(null, mockSocket2);

			player.emit("boop", {x: 10});
			player.emitToAll("troop", {y: 20});

			assert.deepEqual(mockSocket.messages, [
				["boop", {x: 10}],
				["troop", {y: 20}]
			]);

			assert.deepEqual(mockSocket2.messages, [
				["troop", {y: 20}]
			]);
		});
	});

	describe("#goToJail(), decrementJailDays(), getOutOfJail()", () => {
		it("performs jail time for a user", () => {
			mockIo.resetMock();
			mockSocket.resetMock();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});
			player.configureEmitter(mockIo, mockSocket);

			player.savedMessages = [];
			player.goToJail();
			assert.equal(player.jailDays, 3);
			assert.equal(player.placeIdx, 10);
			assert.deepEqual(player.savedMessages, [["log", "You will be in jail for 3 turns!"]]);

			player.savedMessages = [];
			player.decrementJailDays();
			assert.equal(player.jailDays, 2);
			assert.deepEqual(player.savedMessages, []);

			player.savedMessages = [];
			player.getOutOfJail();
			assert.equal(player.jailDays, 0);
			assert.deepEqual(player.savedMessages, [["log", "You are now out of jail!"]]);

			assert.deepEqual(mockIo.messages, [
				["update-location", {placeIdx: 10, playerId: 0}],
				["go-to-jail", {playerId: 0}],
				["update-jail-days", {jailDays: 2, playerId: 0}],
				["get-out-of-jail", {playerId: 0}]
			]);

			assert.deepEqual(mockSocket.messages, [
				["log", "You will be in jail for 3 turns!"],
				["log", "You are now out of jail!"]
			]);
		});
	});

	describe("#updateBalance()", () => {
		it("increments the balance for all users", () => {
			mockSocket.resetMock();
			mockIo.resetMock();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});
			player.configureEmitter(mockIo, mockSocket);

			player.updateBalance(3);
			assert.equal(player.balance, 1503);
			assert.deepEqual(mockSocket.messages, []);
			assert.deepEqual(mockIo.messages, [
				["update-balance", {balance: 1503, playerId: 0}]
			]);
		});
	});

	describe("#updateLocation()", () => {
		it("updates the location for all users", () => {
			mockSocket.resetMock();
			mockIo.resetMock();

			const player = new Player(new PlayerRecord("my name", "my id", 0, "my image"), {});
			player.configureEmitter(mockIo, mockSocket);

			player.updateLocation(50);
			assert.equal(player.placeIdx, 50);
			assert.deepEqual(mockSocket.messages, []);
			assert.deepEqual(mockIo.messages, [
				["update-location", {placeIdx: 50, playerId: 0}]
			]);
		});
	});

	describe("#serialize()", () => {
		it("serializes the player back into a record", () => {
			const playerRecord = new PlayerRecord("my name", "my id", 0, "my image")
			// The mock game and socket should get removed.
			const player = new Player(playerRecord, {});
			player.configureEmitter(mockIo, mockSocket);

			const actual = player.serialize();
			assert.deepEqual(playerRecord, actual);
		});
	});
});
