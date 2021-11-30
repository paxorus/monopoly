const assert = require("assert");
const Mock = require("../test-utils/mock.js");
const proxyquire = require("proxyquire");


describe("Lobby Event Handlers", () => {

	describe("#onLobbyConnection()", () => {

		let actualGameActionCalls = [];

		const [mudkip, treecko] = Mock.playerRecords(["Mudkip", "Treecko"]);
		const lobbies = {
			"lobby-0-xyz": Mock.lobby("Lobby 0", 1.55e12, mudkip)
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
			}

			emit(eventName, message) {
				this.sentMessages.push([eventName, message]);
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

			call(eventName, ...args) {
				return this.registeredCallbacks[eventName](...args);
			}
		}

		it("adds the socket to the room and locates the player and game on start-up, and removes the socket on disconnect", () => {
			const mockIo = new MockIo();
			const mockSocket = new MockSocket();

			// Register the callbacks.
			onLobbyConnection(MockIo, mockSocket, "my user id");

			mockSocket.call("open-lobby", {lobbyId: "lobby-0-xyz"});
			assert.equal(mockSocket.roomName, "lobby-lobby-0-xyz");
		});
	});
});
