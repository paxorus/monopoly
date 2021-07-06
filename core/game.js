const {LocationInfo} = require("./location-configs.js");
const {Player} = require("./player.js");

/**
 * A serializable representation of a game.
 * Namely, it has PlayerRecord objects instead of Player objects.
 */
class GameRecord {
	constructor(lobbyRecord) {
		this.id = lobbyRecord.id;
		this.name = lobbyRecord.name;
		this.adminId = lobbyRecord.adminId;

		this.createTime = +new Date();

		const playerData = Object.entries(lobbyRecord).map(([userId, {name, sprite}], idx) => {
			return new PlayerRecord(name, userId, idx, sprite);
		});
		this.playerData = playerData;

		// Choose starting player at random.
		this.currentPlayerId = Math.floor(Math.random() * playerData.length);

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
}

class Game {
	constructor(gameRecord) {
		this.id = gameRecord.id;
		this.name = gameRecord.name;
		this.adminId = gameRecord.adminId;
		this.createTime = gameRecord.createTime;
		this.currentPlayerId = gameRecord.currentPlayerId;
		this.hasStarted = gameRecord.hasStarted;// TODO: Doesn't seem necessary.
		this.tax = gameRecord.tax;
		this.locationData = gameRecord.locationData;
		this.numTurns = gameRecord.numTurns;
		this.lastUpdateTime = gameRecord.lastUpdateTime;

		this.players = gameRecord.playerData.map(playerRecord => new Player(playerRecord, this));
		
		const placeStateMap = Object.fromEntries(gameRecord.locationData.map(placeState => [placeState.placeIdx, placeState]));
		// TODO: What is this doing beyond the GameRecord?
		this.places = LocationInfo.map((placeConfig, placeIdx) =>
			placeConfig.price > 0 ? {
				...placeStateMap[placeIdx],
				...placeConfig
			} : placeConfig
		);
	}

	serialize() {

	}
}

module.exports = {
	Game,
	GameRecord
};