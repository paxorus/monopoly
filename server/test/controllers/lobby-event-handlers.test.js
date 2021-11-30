const assert = require("assert");
const Mock = require("../test-utils/mock.js");
const proxyquire = require("proxyquire");


describe("Lobby Event Handlers", () => {

	describe("#onLobbyConnection()", () => {

		let actualGameActionCalls = [];

		const [mudkip, treecko] = Mock.playerRecords(["Mudkip", "Treecko"]);
		const lobby = Mock.lobby("Lobby 0", 1.55e12, mudkip);
		const lobbies = {
			"lobby-0-xyz": lobby
		};
		const users = {
			[mudkip.userId]: {
				gameIds: [],
				lobbyIds: ["lobby-0-xyz"],
				secretKey: ""
			},
			[treecko.userId]: {
				gameIds: [],
				lobbyIds: [],
				secretKey: ""
			}
		};

		const calls = [];
		const {onLobbyConnection} = proxyquire("../../controllers/lobby-event-handlers.js", {
			// Plant a mock game.
			"../storage/lookup.js": {
				fetchLobby: (lobbyId) => lobbies[lobbyId],
				fetchUser: (userId) => users[userId],
				convertLobbyToGame() {calls.push(["convertLobbyToGame", ...arguments])},
				deleteLobby() {calls.push(["convertLobbyToGame", ...arguments])}
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

		it("allows a user to open and view the lobby and subscribe to real-time updates", () => {
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();
			onLobbyConnection(mockIo, mockSocket, treecko.userId);

			mockSocket.receive("open-lobby", {lobbyId: "lobby-0-xyz"});
			assert.equal(mockSocket.roomName, "lobby-lobby-0-xyz");

			mockSocket.receive("disconnect", {lobbyId: "lobby-0-xyz"});			
		});

		it("allows a user to join and leave the lobby", () => {
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
			// assert.deepEqual(mockIo.sentMessages, [["leave-lobby", {userId: treecko.userId}]]);
			assert.deepEqual(lobby.memberMap, {
				[mudkip.userId]: {name: mudkip.name, sprite: mudkip.spriteFileName}
			});
			assert.deepEqual(users[treecko.userId].lobbyIds, []);
		});
	});
});
