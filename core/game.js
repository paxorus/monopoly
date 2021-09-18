const {LocationInfo} = require("./location-configs.js");
const {Player, PlayerRecord} = require("./player.js");

/**
 * A serializable representation of a game.
 * Namely, it has PlayerRecord objects instead of Player objects.
 */
class GameRecord {
	constructor(gameId, gameName, adminId, playerRecords) {
		this.id = gameId;
		this.name = gameName;
		this.adminId = adminId;
		this.playerData = playerRecords;

		this.createTime = +new Date();

		// Choose starting player at random.
		this.currentPlayerId = Math.floor(Math.random() * playerRecords.length);

		this.hasStarted = true;

		this.tax = 0;

		// Create a copy of the locations.
		this.locationData = LocationInfo.map(place =>
			place.price > 0 ? ({
				ownerNum: -1,
				houseCount: 0,
				isMortgaged: false,
				...place
			}) : place
		);

		this.numTurns = 0;
		this.lastUpdateTime = null;
	}

	buildFromLobby(lobbyRecord) {
		const playerRecords = Object.entries(lobbyRecord.lobby).map(([userId, {name, sprite}], idx) => {
			return new PlayerRecord(name, userId, idx, sprite);
		});

		return new GameRecord(
			lobbyRecord.id,
			lobbyRecord.name,
			lobbyRecord.adminId,
			playerRecords
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
		// this.hasStarted = gameRecord.hasStarted;// TODO: Doesn't seem necessary.
		this.tax = gameRecord.tax;
		// this.locationData = gameRecord.locationData;
		this.numTurns = gameRecord.numTurns;
		this.lastUpdateTime = gameRecord.lastUpdateTime;

		this.players = gameRecord.playerData.map(playerRecord => new Player(playerRecord, this));

		// const placeStateMap = Object.fromEntries(gameRecord.locationData.map(placeState => [placeState.placeIdx, placeState]));
		// // TODO: What is this doing beyond the GameRecord?
		// this.places = LocationInfo.map((placeConfig, placeIdx) =>
		// 	placeConfig.price > 0 ? {
		// 		...placeStateMap[placeIdx],
		// 		...placeConfig
		// 	} : placeConfig
		// );
		this.places = gameRecord.locationData;
	}

	serialize() {
		const playerRecords = this.players.map(player => player.serialize());
		const record = new GameRecord(this.id, this.name, this.adminId, playerRecords);

		record.createTime = this.createTime;
		record.currentPlayerId = this.currentPlayerId;
		record.hasStarted = this.hasStarted;
		record.tax = this.tax;

		record.numTurns = this.numTurns;
		record.lastUpdateTime = this.lastUpdateTime;

		record.locationData = this.places;

		return record;
	}
}

module.exports = {
	Game,
	GameRecord
};