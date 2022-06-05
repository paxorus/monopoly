const {Game, GameRecord} = require("../../models/game.js");
const {PlayerRecord} = require("../../models/player.js");
const {MockSocket} = require("./mock-socket.js");


function getFreshGame() {
	const game = new Game(new GameRecord("my game id", "my game name", "my admin id", [
		new PlayerRecord("player 0 name", "user id 0", 0, "player sprite 0"),
		new PlayerRecord("player 1 name", "user id 1", 1, "player sprite 1"),
		new PlayerRecord("player 2 name", "user id 2", 2, "player sprite 2")
	], [
		{placeIdx: 37, ownerNum: 0, houseCount: 0, isMortgaged: true},
		{placeIdx: 39, ownerNum: 0, houseCount: 2, isMortgaged: false}
	]));

	game.currentPlayerId = 0;

	const player0 = game.players[0];
	const mockSocket0 = new MockSocket();
	player0.configureEmitter(null, mockSocket0);

	return {
		game,
		player0,
		mockSocket0
	};
}

module.exports = {
	getFreshGame
};