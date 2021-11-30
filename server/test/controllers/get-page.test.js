const assert = require("assert");
const RandomInt = require("../../fickle/random-int.js");
const TimeNow = require("../../fickle/time-now.js");
const {Game, GameRecord, Lobby, LobbyRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");
const proxyquire = require("proxyquire");


describe("Get Page", () => {

	// Set up mock data.
	const playerIcons = [
		"/images/sprites/025Pikachu-240x240.png",
		"/images/sprites/092Gastly-138x130.png",
		"/images/sprites/252Treecko-220x220.png",
		"/images/sprites/255Torchic-140x230.png",
		"/images/sprites/258Mudkip-205x215.png",
		"/images/sprites/382Kyogre-Primal-240x240.png",
		"/images/sprites/384Rayquaza-Mega-240x240.png",
		"/images/sprites/386Deoxys-Attack-103x135.png",
		"/images/sprites/483Dialga-240x240.png",
		"/images/sprites/644Zekrom-240x240.png"
	];

	const playerRecords = [
		new PlayerRecord("Mudkip", "user id 0", 0, "mudkip", "blue"),
		new PlayerRecord("Treecko", "user id 1", 1, "treecko", "green")
	];
	RandomInt._inject(0, 1);// Starting player IDs
	const games = {
		"game id 1": new Game(new GameRecord("game id 1", "game name 1", "user id 0", playerRecords, [
			{placeIdx: 37, ownerNum: 0, houseCount: 0, isMortgaged: true},
			{placeIdx: 39, ownerNum: 0, houseCount: 2, isMortgaged: false}
		])),
		"game id 2": new Game(new GameRecord("game id 2", "game name 2", "user id 0", playerRecords, []))
	};

	const {getLandingPage, getGameplayOrLobbyPage} = proxyquire("../../controllers/get-page.js", {
		"../auth.js": {
			httpAuthenticatePlayer: () => true
		},
		"../storage/lookup.js": {
			fetchUser: () => ({gameIds: ["game id 1", "game id 2"], lobbyIds: ["lobby id 0"]}),
			fetchGame(gameId) {
				return games[gameId];
			},
			fetchLobby(lobbyId) {
				const lobbies = {
					"lobby id 0": new Lobby(new LobbyRecord("lobby id 0", "lobby name 0", "user id 0", "Mudkip", "mudkip"))
				};
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
				cookies: {userId: "user id 1", landingToast: "Bruh, toast to you!"}
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
					"yourId": "user id 1",
					"inProgressGames": [
						{
							"id": "game id 1",
							"name": "game name 1",
							"timeSinceCreated": "a few seconds ago",
							"creatorName": "Mudkip",
							"yourName": "Treecko",
							"timeSinceUpdated": "never",
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
							"id": "game id 2",
							"name": "game name 2",
							"timeSinceCreated": "a few seconds ago",
							"creatorName": "Mudkip",
							"yourName": "Treecko",
							"timeSinceUpdated": "never",
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
							"id": "lobby id 0",
							"name": "lobby name 0",
							"timeSinceCreated": "a few seconds ago",
							"adminName": "Mudkip",
							"adminId": "user id 0",
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
				params: {gameId: "game id 1"},
				cookies: {userId: "user id 0"}
			};
			const mockResponse = {
				render(pageName, data) {this.data = {pageName, data}}
			};

			getGameplayOrLobbyPage(mockRequest, mockResponse);

			assert.deepEqual(mockResponse.data, {
				"pageName": "pages/gameplay",
				"data": {
					"gameId": "game id 1"
				}
			});
		});

		it("renders the lobby page", () => {
			const mockRequest = {
				params: {gameId: "lobby id 0"},
				cookies: {userId: "user id 0"}
			};
			const mockResponse = {
				render(pageName, data) {this.data = {pageName, data}}
			};

			TimeNow._inject(1.6e12);
			TimeNow._inject(1.55e12);

			getGameplayOrLobbyPage(mockRequest, mockResponse);

			assert.deepEqual(mockResponse.data, {
				"pageName": "pages/lobby",
				"data": {
					"parameters": {
						"lobbyId": "lobby id 0",
						"gameName": "lobby name 0",
						"adminId": "user id 0",
						"yourId": "user id 0",
						"hasJoinedGame": true,
						"gameCreateTime": {
							"friendly": "2 years ago",
							"timestamp": 1.55e12
						},
						"joinedPlayers": {
							"user id 0": {
								"name": "Mudkip",
								"sprite": "mudkip"
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
