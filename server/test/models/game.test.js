const assert = require("assert");
const {Game, GameRecord, Lobby, LobbyRecord} = require("../../models/game.js");
const RandomInt = require("../../fickle/random-int.js");
const TimeNow = require("../../fickle/time-now.js");


describe("GameRecord", () => {

	describe("#buildFromLobby()", () => {
		it("should build a game record from a lobby record", () => {
			const expected = {
				"adminId": "user id 1",
				"createTime": 1600000000000,
				"currentPlayerId": 1,
				"id": "my game id",
				"lastUpdateTime": null,
				"name": "my game name",
				"numTurns": 0,
				"playerData": [
					{
						"balance": 1500,
						"jailDays": 0,
						"latestRoll": null,
						"name": "user name 1",
						"num": 0,
						"numJailCards": 0,
						"placeIdx": 0,
						"rollCount": 0,
						"savedMessages": [],
						"spriteFileName": "user sprite 1",
						"userId": "user id 1"
					},
					{
						"balance": 1500,
						"jailDays": 0,
						"latestRoll": null,
						"name": "user name 2",
						"num": 1,
						"numJailCards": 0,
						"placeIdx": 0,
						"rollCount": 0,
						"savedMessages": [],
						"spriteFileName": "user sprite 2",
						"userId": "user id 2"
					},
					{
						"balance": 1500,
						"jailDays": 0,
						"latestRoll": null,
						"name": "user name 3",
						"num": 2,
						"numJailCards": 0,
						"placeIdx": 0,
						"rollCount": 0,
						"savedMessages": [],
						"spriteFileName": "user sprite 3",
						"userId": "user id 3"
					}
				],
				"tax": 0
			};

			const lobby = new Lobby(new LobbyRecord(
				"my game id",
				"my game name",
				"user id 1",
				"user name 1",
				"user sprite 1"
			));
			lobby.addMember("user id 2", "user name 2", "user sprite 2");
			lobby.addMember("user id 3", "user name 3", "user sprite 3");

			TimeNow._inject(1.6e12);
			RandomInt._inject(1);
			const gameRecord = GameRecord.prototype.buildFromLobby(lobby);

			// Place records are tested separately below.
			const {placeRecords, ...actual} = gameRecord;

			assert.equal(placeRecords.length, 28);
			assert.deepEqual(actual, expected);
		});
	});
});

describe("Game", () => {

	const gameRecord = {
		id: "my 20-letter game id",
		name: "my game name",
		adminId: "my player name",
		playerData: [],// Player records are tested separately.
		createTime: 1.6e12,
		currentPlayerId: 2,
		tax: 250,
		placeRecords: [],// Place array records are tested separately.
		numTurns: 50,
		lastUpdateTime: 1.7e12
	};

	describe("#constructor()", () => {
		it("recovers a Game from a stored GameRecord", () => {
			const actualGame = new Game(gameRecord);
			const {places, ...actual} = actualGame;

			const expected = {
				"adminId": "my player name",
				"createTime": 1600000000000,
				"currentPlayerId": 2,
				"id": "my 20-letter game id",
				"lastUpdateTime": 1700000000000,
				"name": "my game name",
				"numTurns": 50,
				"players": [],
				"tax": 250
			};

			assert.equal(places.length, 40);
			assert.deepEqual(actual, expected);
		});
	});

	describe("#serialize()", () => {
		it("serialize a Game into a GameRecord for transport and storage", () => {
			const actualGame = new Game(gameRecord);

			const actualGameRecord = actualGame.serialize();
			const {placeRecords, ...actual} = actualGameRecord;

			const expected = {...gameRecord};
			delete expected.placeRecords;

			assert.equal(placeRecords.length, 28);
			assert.deepEqual(actual, expected);
		});
	});
});
