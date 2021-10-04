const assert = require("assert");
const {createGameLobby, _inject, _uninject} = require("../../controllers/admin-actions.js");
const TimeNow = require("../../fickle/time-now.js");


describe("Admin Actions", () => {

	describe("#createGameLobby()", () => {
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
			const mockData = {
				lobbies: {},
				users: {
					"my user id": {
						lobbyIds: []
					}
				}
			};
			const mockRandomId = () => "my game id";

			_inject(mockData, mockRandomId);
			TimeNow._inject(1.6e12);

			createGameLobby(mockRequest, mockResponse);

			assert.deepEqual(mockData.lobbies, {
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

			assert.deepEqual(mockData.users, {
				"my user id": {
					"lobbyIds": [
						"my game id"
					]
				}
			});

			assert.deepEqual(mockResponse.data, {"newGameId": "my game id"});

			TimeNow._uninject();
		});
	});
});
