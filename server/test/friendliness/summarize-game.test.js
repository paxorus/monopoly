const assert = require("assert");
const {summarizeGame, summarizeLobby} = require("../../friendliness/summarize-game.js");
const {Game, GameRecord, Lobby, LobbyRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");
const TimeNow = require("../../fickle/time-now.js");
const RandomInt = require("../../fickle/random-int.js");


describe("Summarize Game", () => {

	const SECOND = 1000;
	const MINUTE = 60 * SECOND;
	const HOUR = 60 * MINUTE;
	const DAY = 24 * HOUR;

	describe("#summarizeGame()", () => {
		it("should summarize an in-progress game", () => {
			const nowInMillis = +new Date();
			TimeNow._inject(nowInMillis - 5 * DAY);// Game create time
			RandomInt._inject(1);

			const myPlayerId = "my id";
			const myPlayer = new PlayerRecord("my name", myPlayerId, 0, "my image");
			myPlayer.balance = 1200;
			const adminPlayer = new PlayerRecord("admin name", "admin id", 1, "admin image");

			const gameRecord = new Game(new GameRecord("my game id", "my game name", "admin id", [
				myPlayer,
				adminPlayer
			], [{ownerNum: 0, placeIdx: 1}, {ownerNum: 0, placeIdx: 3}]));

			const expectedGameSummary = {
				"creatorName": "admin name",
				"id": "my game id",
				"name": "my game name",
				"numOwnedProperties": 2,
				"numTurns": 0,
				"playerData": [
					{
						"name": "my name",
						"netWorth": 1200,
					},
					{
						"name": "admin name",
						"netWorth": 1500,
					}
				],
				"timeSinceCreated": "5 days ago",
				"timeSinceUpdated": "never",
				"waitingOnName": "admin name",
				"yourName": "my name"
			};

			TimeNow._inject(nowInMillis);// Inject for age-to-text helper
			assert.deepEqual(summarizeGame(gameRecord, myPlayerId), expectedGameSummary);
		});

		it("should summarize a lobby", () => {
			const nowInMillis = +new Date();
			TimeNow._inject(nowInMillis - 7 * HOUR);

			const lobby = new Lobby(new LobbyRecord("my lobby id", "my lobby name", "admin id", "admin name", null));
			lobby.addMember("my player id", "my player name", null);

			TimeNow._inject(nowInMillis);
			assert.deepEqual(summarizeLobby(lobby, "my player id"), {
				"adminId": "admin id",
				"adminName": "admin name",
				"id": "my lobby id",
				"name": "my lobby name",
				"playerNames": [
					"admin name",
					"my player name",
				],
				"timeSinceCreated": "7 hours ago"
			});
		});
	});
});