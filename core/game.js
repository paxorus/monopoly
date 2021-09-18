const {LocationInfo} = require("./location-configs.js");
const {Player, PlayerRecord} = require("./player.js");

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

		this.createTime = +new Date();

		// Choose starting player at random.
		this.currentPlayerId = Math.floor(Math.random() * playerRecords.length);

		this.hasStarted = true;

		this.tax = 0;

		this.placeRecords = placeRecords;

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
		// this.hasStarted = gameRecord.hasStarted;// TODO: Doesn't seem necessary.
		this.tax = gameRecord.tax;
		// this.locationData = gameRecord.locationData;
		this.numTurns = gameRecord.numTurns;
		this.lastUpdateTime = gameRecord.lastUpdateTime;

		this.players = gameRecord.playerData.map(playerRecord => new Player(playerRecord, this));

		this.places = PlacesArray.prototype.build(gameRecord.placeRecords);
	}

	serialize() {
		const playerRecords = this.players.map(player => player.serialize());
		const placeRecords  = PlacesArray.prototype.serialize(this.placeRecords);
		const record = new GameRecord(this.id, this.name, this.adminId, playerRecords, placeRecords);

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

/**
 * A serializable representation of PlacesArray.
 * Namely, it only contains property state, so its fields are disjoint from LocationInfo and excludes
 * any non-property locations.
 */
class PlacesArrayRecord {
	build() {
		// Initialize state for each property location. Add the place's index to identify the place after
		// non-properties are removed.
		return LocationInfo
			.map((place, index) => [place.price, index])
			.filter(([price, placeIdx]) => price > 0)
			.map(([price, placeIdx]) => ({
				placeIdx,
				ownerNum: -1,
				houseCount: 0,
				isMortgaged: false
			}));
	}
}

class PlacesArray {

	build(placeRecords) {
		// Bootstrap the record's property state with LocationInfo.
		const placeStateMap = Object.fromEntries(placeRecords.map(({placeIdx, ...placeState}) => [placeIdx, placeState]));

		return LocationInfo.map((placeConfig, placeIdx) =>
			placeConfig.price > 0 ? {
				...placeStateMap[placeIdx],
				...placeConfig
			} : placeConfig
		);
	}

	serialize(placesArray) {
		// Remove all non-property locations, and extract only the property state fields.
		return placesArray
			.map((place, index) => [place, index])
			.filter(([place, placeIdx]) => place.price > 0)
			.map(([place, placeIdx]) => ({
				placeIdx,
				ownerNum: place.ownerNum,
				houseCount: place.houseCount,
				isMortgaged: place.isMortgaged
			}));
	}
}

module.exports = {
	Game,
	GameRecord,
	PlacesArray,
	PlacesArrayRecord
};