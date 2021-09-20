const {Player, PlayerRecord} = require("../models/player.js");
const {getRandomInt} = require("../fickle/random-int.js");
const {getTimeNow} = require("../fickle/time-now.js");
const {PlacesArray, PlacesArrayRecord} = require("./places-array.js");

/**
 * A serializable representation of a game.
 * Namely, it has PlayerRecord objects instead of Player objects.
 */
class GameRecord {
	constructor(gameId, gameName, adminId, playerRecords, placeRecords) {
		this.id = gameId;
		this.name = gameName;
		this.adminId = adminId;
		this.playerData = playerRecords;

		this.createTime = getTimeNow();

		// Choose starting player at random.
		this.currentPlayerId = getRandomInt(playerRecords.length);

		this.hasStarted = true;

		this.tax = 0;

		this.placeRecords = placeRecords;

		this.numTurns = 0;
		this.lastUpdateTime = null;
	}

	buildFromLobby(lobbyRecord) {
		const playerRecords = Object.entries(lobbyRecord.lobby)
			.map(([userId, {name, sprite}], idx) => new PlayerRecord(name, userId, idx, sprite));

		return new GameRecord(
			lobbyRecord.id,
			lobbyRecord.name,
			lobbyRecord.adminId,
			playerRecords,
			PlacesArrayRecord.prototype.build()
		);
	}
}

class Game {
	constructor(gameRecord) {
		this.id = gameRecord.id;
		this.name = gameRecord.name;
		this.adminId = gameRecord.adminId;
		this.createTime = gameRecord.createTime;
		this.currentPlayerId = gameRecord.currentPlayerId;
		this.tax = gameRecord.tax;
		this.numTurns = gameRecord.numTurns;
		this.lastUpdateTime = gameRecord.lastUpdateTime;

		this.players = gameRecord.playerData.map(playerRecord => new Player(playerRecord, this));

		this.places = PlacesArray.prototype.build(gameRecord.placeRecords);
	}

	serialize() {
		const playerRecords = this.players.map(player => player.serialize());
		const placeRecords  = PlacesArray.prototype.serialize(this.places);
		const record = new GameRecord(this.id, this.name, this.adminId, playerRecords, placeRecords);

		record.createTime = this.createTime;
		record.currentPlayerId = this.currentPlayerId;
		record.hasStarted = true;
		record.tax = this.tax;

		record.numTurns = this.numTurns;
		record.lastUpdateTime = this.lastUpdateTime;

		return record;
	}
}

module.exports = {
	Game,
	GameRecord
};