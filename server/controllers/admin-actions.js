const Lookup = require("../storage/lookup.js");
const {randomId} = require("../auth.js");
const {getTimeNow} = require("../fickle/time-now.js");
const {Lobby, LobbyRecord} = require("../models/game.js");


function createGameLobby(req, res) {
	const {gameName, adminDisplayName, adminSpriteSrc} = req.body;

	const {userId} = req.cookies;
	const gameId = randomId();

	Lookup.createLobby(new Lobby(new LobbyRecord(gameId, gameName, userId, adminDisplayName, adminSpriteSrc)));
	Lookup.fetchUser(userId).lobbyIds.push(gameId);

	res.send({
		newGameId: gameId
	});
}

module.exports = {
	createGameLobby
};
