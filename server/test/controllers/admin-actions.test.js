const assert = require("assert");
const TimeNow = require("../../fickle/time-now.js");
const proxyquire = require("proxyquire");


describe("Admin Actions", () => {

	describe("#createGameLobby()", () => {

		let mockLobbies = {};
		let mockUser = {
			lobbyIds: []
		};

		const {createGameLobby} = proxyquire("../../controllers/admin-actions.js", {
			"../auth.js": {
				randomId: () => "my game id"
			},
			"../storage/lookup.js": {
				createLobby(lobby) {mockLobbies[lobby.id] = lobby},
				fetchUser() {return mockUser}
			}
		});

		it("should create a game record, update the user record, and send the new game ID to the client", () => {
			const mockRequest = {
				body: {
					gameName: "my game",
					adminDisplayName: "my player",
					adminSpriteSrc: "my player image"
				},
				cookies: {userId: "my user id"}
			};
			const mockResponse = {
				send: function (x) {this.data = x}
			};

			TimeNow._inject(1.6e12);

			createGameLobby(mockRequest, mockResponse);

			assert.deepEqual(mockLobbies, {
				"my game id": {
					"adminId": "my user id",
					"createTime": 1600000000000,
					"id": "my game id",
					"memberMap": {
						"my user id": {
							"name": "my player",
							"sprite": "my player image"
						}
					},
					"name": "my game"
				}
			});

			assert.deepEqual(mockUser, {
				"lobbyIds": [
					"my game id"
				]
			});

			assert.deepEqual(mockResponse.data, {"newGameId": "my game id"});
		});
	});
});
