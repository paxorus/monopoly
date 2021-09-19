let Data = require("../storage/data.js");
let {randomId} = require("../auth.js");
const {getTimeNow} = require("../fickle/time-now.js");


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

	// TODO: Can I use GameRecord here? Watch out for hasStarted.
	const newGame = {
		id: gameId,
		name: gameName,
		adminId: userId,
		createTime: getTimeNow(),
		hasStarted: false,
		hasCompleted: false,
		lobby: {
			// Admin is always in the lobby. They cannot leave it, only disband.
			[userId]: {name: adminDisplayName, sprite: adminSpriteSrc}
		}
	};
	// TODO: game registration should be blocking DB write
	Data.games[gameId] = newGame;
	Data.users[userId].gameIds.push(gameId);

	res.send({
		newGameId: gameId
	});
}

module.exports = {
	createGameLobby,
	_inject,
	_uninject
};
