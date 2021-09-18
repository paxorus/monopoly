const Data = require("./data.js");
const {randomId} = require("./auth.js");


function createGameLobby(req, res) {
	const {gameName, adminDisplayName, adminSpriteSrc} = req.body;

	const {userId} = req.cookies;
	const gameId = randomId();
	const newGame = {
		id: gameId,
		name: gameName,
		adminId: userId,
		createTime: +new Date(),
		hasStarted: false,
		hasCompleted: false,
		lobby: {
			// Admin is always in the lobby. They cannot leave it, only disband.
			[userId]: {name: adminDisplayName, sprite: adminSpriteSrc}
		}
	};
	// TODO: blocking game registration
	Data.games[gameId] = newGame;
	Data.users[userId].gameIds.push(gameId);

	res.send({
		newGameId: gameId
	});
}

module.exports = {
	createGameLobby
};
