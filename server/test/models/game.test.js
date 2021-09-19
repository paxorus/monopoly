const assert = require("assert");
const {GameRecord, Game} = require("../../models/game.js");
const RandomInt = require("../../fickle/random-int.js");
const TimeNow = require("../../fickle/time-now.js");


describe("GameRecord", () => {

	describe("#buildFromLobby()", () => {
		it("should build a game record from a lobby record", () => {
			const expected = {
				"adminId": "user id 2",
				"createTime": 1600000000000,
				"currentPlayerId": 1,
				"hasStarted": true,
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

			const lobbyRecord = {
				id: "my game id",
				name: "my game name",
				adminId: "user id 2",
				lobby: {
					"user id 1": {name: "user name 1", sprite: "user sprite 1"},
					"user id 2": {name: "user name 2", sprite: "user sprite 2"},
					"user id 3": {name: "user name 3", sprite: "user sprite 3"}
				}
			};

			TimeNow._inject(1.6e12);
			RandomInt._inject(1);
			const gameRecord = GameRecord.prototype.buildFromLobby(lobbyRecord);
			TimeNow._uninject();
			RandomInt._uninject(1);

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
		hasStarted: true,
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

			assert.equal(placeRecords.length, 40);
			assert.deepEqual(actual, expected);
		});
	});
});
