const assert = require("assert");
const {LocationInfo} = require("../../game-logic/location-configs.js");
const {GameRecord, Game, PlacesArrayRecord, PlacesArray} = require("../../models/game.js");
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


describe("PlacesArrayRecord", () => {

	describe("#build()", () => {
		it("should initialize state for all properties", () => {
			const expected = [
				{ placeIdx: 1, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 3, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 5, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 6, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 8, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 9, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 11, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 12, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 13, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 14, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 15, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 16, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 18, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 19, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 21, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 23, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 24, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 25, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 26, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 27, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 28, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 29, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 31, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 32, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 34, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 35, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 37, ownerNum: -1, houseCount: 0, isMortgaged: false },
				{ placeIdx: 39, ownerNum: -1, houseCount: 0, isMortgaged: false }
			]

			assert.deepEqual(PlacesArrayRecord.prototype.build(), expected);
		});
	});
});

describe("PlacesArray", () => {

	describe("#build()", () => {
		it("should merge the location configs with state from the records", () => {
			const inputPlaceRecords = [
				{ placeIdx: 1, ownerNum: 0, houseCount: 5, isMortgaged: true },
				{ placeIdx: 3, ownerNum: 1, houseCount: 10, isMortgaged: false }
			];

			const expected = [...LocationInfo];
			expected[1] = {...expected[1], ...{ ownerNum: 0, houseCount: 5, isMortgaged: true }};
			expected[3] = {...expected[3], ...{ ownerNum: 1, houseCount: 10, isMortgaged: false }};

			const actual = PlacesArray.prototype.build(inputPlaceRecords)

			assert.equal(actual.length, 40);
			assert.deepEqual(actual, expected);
		});
	});

	describe("#serialize()", () => {
		it("should extract the property state", () => {
			const expected = [
				{ placeIdx: 1, ownerNum: 0, houseCount: 5, isMortgaged: true },
				{ placeIdx: 3, ownerNum: 1, houseCount: 10, isMortgaged: false },
				{ placeIdx: 5, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 6, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 8, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 9, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 11, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 12, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 13, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 14, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 15, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 16, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 18, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 19, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 21, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 23, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 24, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 25, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 26, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 27, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 28, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 29, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 31, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 32, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 34, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 35, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 37, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined },
				{ placeIdx: 39, ownerNum: undefined, houseCount: undefined, isMortgaged: undefined }
			];

			const input = [...LocationInfo];
			input[1] = {...input[1], ...{ ownerNum: 0, houseCount: 5, isMortgaged: true }};
			input[3] = {...input[3], ...{ ownerNum: 1, houseCount: 10, isMortgaged: false }};

			const actual = PlacesArray.prototype.serialize(input);

			assert.equal(actual.length, 28);
			assert.deepEqual(actual, expected);
		});
	});
});
