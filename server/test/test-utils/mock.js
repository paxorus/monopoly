const {Game, GameRecord, Lobby, LobbyRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");

function nameToId(name) {
	return name.toLowerCase().replace(/\s/g, "-") + "-xyz";
}

function playerRecords(names) {
	return names.map((name, num) => new PlayerRecord(name, nameToId(name) + "-" + num, num, `${name}.png`, `rgb(${name})`));
}

function lobby(name, createTime, adminPlayerRecord) {
	const lobby = new Lobby(new LobbyRecord(nameToId(name), name, adminPlayerRecord.userId, adminPlayerRecord.name, adminPlayerRecord.spriteFileName));
	lobby.createTime = createTime;// Inject fickle value
	return lobby;
}

function game(name, startingPlayerId, playerRecords, placeRecordsOption) {
	const placeRecords = placeRecordsOption || [];
	const game = new Game(new GameRecord(nameToId(name), name, playerRecords[0].userId, playerRecords, placeRecords));
	game.currentPlayerId = startingPlayerId;// Inject fickle value
	return game;
}

module.exports = {
	game,
	lobby,
	playerRecords
};