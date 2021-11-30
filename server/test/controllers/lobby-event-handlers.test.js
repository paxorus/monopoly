const assert = require("assert");
const {Game} = require("../../models/game.js");
const Mock = require("../test-utils/mock.js");
const proxyquire = require("proxyquire");


describe("Lobby Event Handlers", () => {
	const lobbies = {};
	const users = {};
	let calls = [];

	function resetData() {
		const [mudkip, treecko] = Mock.playerRecords(["Mudkip", "Treecko"]);
		const lobby = Mock.lobby("Lobby 0", 1.55e12, mudkip);
		lobbies["lobby-0-xyz"] = lobby;

		users[mudkip.userId] = {
			gameIds: [],
			lobbyIds: ["lobby-0-xyz"],
			secretKey: ""
		};
		users[treecko.userId] = {
			gameIds: [],
			lobbyIds: [],
			secretKey: ""
		};

		calls = [];

		return [mudkip, treecko, lobby];
	};

	const {onLobbyConnection} = proxyquire("../../controllers/lobby-event-handlers.js", {
		// Plant a mock game.
		"../storage/lookup.js": {
			fetchLobby: (lobbyId) => lobbies[lobbyId],
			fetchUser: (userId) => users[userId],
			convertLobbyToGame() {calls.push(["convertLobbyToGame", ...arguments])},
			deleteLobby() {calls.push(["deleteLobby", ...arguments])}
		}
	});

	class MockIo {
		constructor() {
			this.sentMessages = [];
		}

		to(roomName) {
			this.roomName = roomName;
			return this;
		}

		emit(eventName, message) {
			this.sentMessages.push([eventName, message]);
		}

		clear() {
			this.sentMessages = [];
		}
	}

	class MockSocket {
		constructor() {
			this.registeredCallbacks = {};
			this.sentMessages = [];
		}

		on(eventName, callback) {
			this.registeredCallbacks[eventName] = callback;
		}

		join(roomName) {
			this.roomName = roomName;
		}

		emit(eventName, message) {
			this.sentMessages.push([eventName, message]);
		}

		receive(eventName, ...args) {
			return this.registeredCallbacks[eventName](...args);
		}
	}

	describe("#open-lobby, disconnect", () => {
		it("allows a user to open and view the lobby and subscribe to real-time updates", () => {
			const [mudkip, treecko, lobby] = resetData();
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();
			onLobbyConnection(mockIo, mockSocket, treecko.userId);

			mockSocket.receive("open-lobby", {lobbyId: "lobby-0-xyz"});
			assert.equal(mockSocket.roomName, "lobby-lobby-0-xyz");

			mockSocket.receive("disconnect", {lobbyId: "lobby-0-xyz"});			
		});
	});

	describe("#join-lobby, leave-lobby", () => {
		it("allows a user to join and leave the lobby", () => {
			const [mudkip, treecko, lobby] = resetData();
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();
			onLobbyConnection(mockIo, mockSocket, treecko.userId);

			mockSocket.receive("open-lobby", {lobbyId: "lobby-0-xyz"});

			mockSocket.receive("join-lobby", {name: treecko.name, sprite: treecko.spriteFileName});
			assert.deepEqual(lobby.memberMap, {
				[mudkip.userId]: {name: mudkip.name, sprite: mudkip.spriteFileName},
				[treecko.userId]: {name: treecko.name, sprite: treecko.spriteFileName}
			});
			assert.deepEqual(mockIo.sentMessages, [["join-lobby", {
				name: treecko.name,
				sprite: treecko.spriteFileName,
				userId: treecko.userId
			}]]);
			assert.deepEqual(users[treecko.userId].lobbyIds, ["lobby-0-xyz"]);
			mockIo.clear();

			mockSocket.receive("leave-lobby");
			assert.equal(mockIo.roomName, "lobby-lobby-0-xyz");
			assert.deepEqual(mockIo.sentMessages, [["leave-lobby", {userId: treecko.userId}]]);
			assert.deepEqual(lobby.memberMap, {
				[mudkip.userId]: {name: mudkip.name, sprite: mudkip.spriteFileName}
			});
			assert.deepEqual(users[treecko.userId].lobbyIds, []);
		});
	});

	describe("#update-admin", () => {
		it("allows the admin to update the game name or their player", () => {
			const [mudkip, treecko, lobby] = resetData();
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();
			onLobbyConnection(mockIo, mockSocket, mudkip.userId);
			mockSocket.receive("open-lobby", {lobbyId: "lobby-0-xyz"});
			mockIo.clear();

			mockSocket.receive("update-admin", {
				gameName: "new game name",
				name: "new name",
				sprite: "new.png"
			});
			assert.deepEqual(lobby.memberMap, {
				[mudkip.userId]: {name: "new name", sprite: "new.png"}
			});
			assert.deepEqual(lobby.name, "new game name");
			assert.deepEqual(mockIo.sentMessages, [["update-admin", {
				userId: mudkip.userId,
				gameName: "new game name",
				name: "new name",
				sprite: "new.png"
			}]]);
		});
	});

	describe("#update-member", () => {
		it("allows a non-admin user to update their player", () => {
			const [mudkip, treecko, lobby] = resetData();
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();
			onLobbyConnection(mockIo, mockSocket, treecko.userId);
			mockSocket.receive("open-lobby", {lobbyId: "lobby-0-xyz"});
			mockSocket.receive("join-lobby", {name: treecko.name, sprite: treecko.spriteFileName});
			mockIo.clear();

			mockSocket.receive("update-member", {name: "new name", sprite: "new.png"});
			assert.deepEqual(lobby.memberMap, {
				[mudkip.userId]: {name: mudkip.name, sprite: mudkip.spriteFileName},
				[treecko.userId]: {name: "new name", sprite: "new.png"}
			});
			assert.deepEqual(mockIo.sentMessages, [["update-member", {
				userId: treecko.userId,
				name: "new name",
				sprite: "new.png"
			}]]);
		});
	});

	describe("#convert-to-game", () => {
		it("allows the admin to convert the lobby to a game", () => {
			const [mudkip, treecko, lobby] = resetData();
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();
			onLobbyConnection(mockIo, mockSocket, mudkip.userId);
			mockSocket.receive("open-lobby", {lobbyId: "lobby-0-xyz"});

			// TODO: Move borderColor lookup to frontend.
			lobby.memberMap[mudkip.userId].sprite = "/images/sprites/258Mudkip-205x215.png";

			mockSocket.receive("convert-to-game", {lobbyId: "lobby-0-xyz"});
			assert.equal(calls[0][0], "convertLobbyToGame");
			assert(calls[0][1] instanceof Game);
			assert.deepEqual(mockIo.sentMessages, [["reload-for-game", undefined]]);
		});
	});

	describe("#disband-lobby", () => {
		it("allows the admin to disband the lobby", () => {
			const [mudkip, treecko, lobby] = resetData();
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();
			onLobbyConnection(mockIo, mockSocket, mudkip.userId);
			mockSocket.receive("open-lobby", {lobbyId: "lobby-0-xyz"});

			mockSocket.receive("disband-lobby", {lobbyId: "lobby-0-xyz"});
			assert.deepEqual(calls, [["deleteLobby", lobby]]);
			assert.deepEqual(mockIo.sentMessages, [["return-to-landing-page", {
				cookieKey: "landingToast",
				cookieValue: {
					adminId: "mudkip-xyz-0",
					eventName: "toast:lobby-disbanded",
					lobbyName: "Lobby 0"
				}
			}]]);
		});
	});
});
