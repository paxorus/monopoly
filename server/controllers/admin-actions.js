let Data = require("../storage/data.js");
let {randomId} = require("../auth.js");
const {getTimeNow} = require("../fickle/time-now.js");
const {LobbyRecord} = require("../models/game.js");


/* Dependency injections */
const [og_Data, og_randomId] = [Data, randomId];

function _inject(mock_Data, mock_randomId) {
	Data = mock_Data;
	randomId = mock_randomId;
}

function _uninject() {
	Data = og_Data;
	randomId = og_randomId;
}

function createGameLobby(req, res) {
	const {gameName, adminDisplayName, adminSpriteSrc} = req.body;

	const {userId} = req.cookies;
	const gameId = randomId();

	// TODO: game registration should be blocking DB write
	Data.lobbies[gameId] = new LobbyRecord(gameId, gameName, userId, adminDisplayName, adminSpriteSrc);
	Data.users[userId].lobbyIds.push(gameId);

	res.send({
		newGameId: gameId
	});
}

module.exports = {
	createGameLobby,
	_inject,
	_uninject
};
