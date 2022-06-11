const assert = require("assert");
const {describeTimeSince} = require("../../friendliness/age-to-text-helper.js");
const {PlayerIcons} = require("../../models/player.js");
const Mock = require("../test-utils/mock.js");
const TimeNow = require("../../fickle/time-now.js");
const proxyquire = require("proxyquire");


describe("Get Page", () => {

	// Set up mock data.
	const playerIcons = PlayerIcons.map(playerIcon => playerIcon.imageSrc);

	const playerRecords = Mock.playerRecords(["Mudkip", "Treecko"]);
	TimeNow._inject(1.51e12, 1.52e12);
	const games = {
		"my-game-1-xyz": Mock.game("My Game 1", 0, playerRecords, [
			{placeIdx: 37, ownerNum: 0, houseCount: 0, isMortgaged: true},
			{placeIdx: 39, ownerNum: 0, houseCount: 2, isMortgaged: false}
		]),
		"my-game-2-xyz": Mock.game("My Game 2", 1, playerRecords)
	};
	const lobbies = {
		"my-lobby-0-xyz": Mock.lobby("Lobby 0", 1.55e12, playerRecords[0])
	};

	const {getLandingPage, getGameplayOrLobbyPage} = proxyquire("../../controllers/get-page.js", {
		"../auth.js": {
			httpAuthenticatePlayer: () => true
		},
		"../storage/lookup.js": {
			fetchUser: () => ({gameIds: Object.keys(games), lobbyIds: Object.keys(lobbies)}),
			fetchGame(gameId) {
				return games[gameId];
			},
			fetchLobby(lobbyId) {
				return lobbies[lobbyId];
			}
		}
	});

	describe("#getLandingPage()", () => {

		it("creates a new user and sends a fresh page", () => {
			const {getLandingPage} = proxyquire("../../controllers/get-page.js", {
				"../auth.js": {
					setNewPlayerAndCookies: () => "my user id"
				}
			});

			const mockRequest = {
				cookies: {}
			};
			const mockResponse = {
				render(pageName, data) {this.data = {pageName, data}}
			};

			getLandingPage(mockRequest, mockResponse);

			assert.deepEqual(mockResponse.data, {
				"pageName": "pages/landing",
				"data": {
					"completedGames": [],
					"inProgressGames": [],
					"landingToast": null,
					"lobbies": [],
					"yourId": "my user id",
					"playerIcons": playerIcons
				}
			});
		});

		it("fetches all games and lobbies for a user", () => {

			const mockRequest = {
				cookies: {userId: "mudkip-xyz-0", landingToast: "Bruh, toast to you!"}
			};
			const mockResponse = {
				render(pageName, data) {this.data = {pageName, data}},
				clearCookie: function () {this.cookiesCleared = true}
			};

			getLandingPage(mockRequest, mockResponse);

			assert.equal(mockResponse.cookiesCleared, true);
			assert.deepEqual(mockResponse.data, {
				"pageName": "pages/landing",
				"data": {
					"completedGames": [],
					"landingToast": "Bruh, toast to you!",
					"yourId": "mudkip-xyz-0",
					"inProgressGames": [
						{
							"id": "my-game-1-xyz",
							"name": "My Game 1",
							"creatorName": "Mudkip",
							"yourName": "Mudkip",
							"gameCreateTime": 1.51e12,
							"gameLastUpdateTime": null,
							"numTurns": 0,
							"numOwnedProperties": 2,
							"playerData": [
								{
									"name": "Mudkip",
									"netWorth": 1500
								},
								{
									"name": "Treecko",
									"netWorth": 1500
								}
							],
							"waitingOnName": "Mudkip"
						},
						{
							"id": "my-game-2-xyz",
							"name": "My Game 2",
							"creatorName": "Mudkip",
							"yourName": "Mudkip",
							"gameCreateTime": 1.52e12,
							"gameLastUpdateTime": null,
							"numTurns": 0,
							"numOwnedProperties": 0,
							"playerData": [
								{
									"name": "Mudkip",
									"netWorth": 1500
								},
								{
									"name": "Treecko",
									"netWorth": 1500
								}
							],
							"waitingOnName": "Treecko"
						}
					],
					"lobbies": [
						{
							"id": "lobby-0-xyz",
							"name": "Lobby 0",
							"gameCreateTime": 1.55e12,
							"adminName": "Mudkip",
							"adminId": "mudkip-xyz-0",
							"playerNames": [
								"Mudkip"
							]
						}
					],
					"playerIcons": playerIcons
				}
			});
		});
	});

	describe("#getGameplayOrLobbyPage()", () => {

		it("renders the gameplay page", () => {
			const mockRequest = {
				params: {gameId: "my-game-1-xyz"},
				cookies: {userId: "mudkip-xyz-0"}
			};
			const mockResponse = {
				render(pageName, data) {this.data = {pageName, data}}
			};

			getGameplayOrLobbyPage(mockRequest, mockResponse);

			assert.deepEqual(mockResponse.data, {
				"pageName": "pages/gameplay",
				"data": {
					"gameId": "my-game-1-xyz"
				}
			});
		});

		it("renders the lobby page", () => {
			const mockRequest = {
				params: {gameId: "my-lobby-0-xyz"},
				cookies: {userId: "mudkip-xyz-0"}
			};
			const mockResponse = {
				render(pageName, data) {this.data = {pageName, data}}
			};

			getGameplayOrLobbyPage(mockRequest, mockResponse);

			assert.deepEqual(mockResponse.data, {
				"pageName": "pages/lobby",
				"data": {
					"parameters": {
						"lobbyId": "lobby-0-xyz",
						"gameName": "Lobby 0",
						"adminId": "mudkip-xyz-0",
						"yourId": "mudkip-xyz-0",
						"hasJoinedGame": true,
						"gameCreateTime": 1.55e12,
						"joinedPlayers": {
							"mudkip-xyz-0": {
								"name": "Mudkip",
								"sprite": "Mudkip.png"
							},
						},
						"playerIcons": playerIcons
					}
				}
			});
		});

		it("renders the 404 page", () => {
			const mockRequest = {
				params: {gameId: "unknown game id"},
				cookies: {userId: "user id 0"}
			};
			const mockResponse = {
				render(pageName, data) {this.data = {pageName, data}}
			};

			getGameplayOrLobbyPage(mockRequest, mockResponse);

			assert.deepEqual(mockResponse.data, {
				"pageName": "pages/404",
				"data": {
					"message": "Game \"unknown game id\" not found."
				}
			});
		});
	});
});
