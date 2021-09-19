const Data = require("../storage/data.js");
const {PlayerIcons} = require("../models/player.js");
const {summarizeGame} = require("../friendliness/summarize-game.js");
const {setNewPlayerAndCookies, httpAuthenticatePlayer} = require("../auth.js");


function getLandingPage(req, res) {
	if ("userId" in req.cookies) {
		const {userId, secretKey} = req.cookies;
		if (!httpAuthenticatePlayer(res, userId, secretKey)) {
			return;
		}

		const user = Data.users[userId];

		// TODO: have page ajax-get the below info after page load
		const userGames = user.gameIds.map(gameId => Data.games[gameId]);
		const inProgressGames = userGames.filter(game => ! game.hasCompleted).map(game => summarizeGame(game, userId));
		const completedGames = userGames.filter(game => game.hasCompleted).map(game => summarizeGame(game, userId));
		res.render("pages/landing", {
			inProgressGames,
			completedGames,
			yourId: userId,
			playerIcons: PlayerIcons
		});
	} else {
		// New user.
		const userId = setNewPlayerAndCookies(res);
		res.render("pages/landing", {
			inProgressGames: [],
			completedGames: [],
			yourId: userId,
			playerIcons: PlayerIcons
		});
	}
}

function getGameplayOrLobbyPage(req, res) {
	const {gameId} = req.params;

	const game = Data.games[gameId];
	if (!game) {
		res.render("pages/404", {
			message: `Game ${gameId} not found.`
		});
		return;
	}

	let {userId, secretKey} = req.cookies;

	if (userId === undefined) {// New visitor.
		userId = setNewPlayerAndCookies(res);
	} else if (!httpAuthenticatePlayer(res, userId, secretKey)) {
		return;
	}

	// TODO: Show game if complete.
	if (game.hasStarted) {
		// Render game.
		res.render("pages/gameplay", {gameId});
	} else {
		// Render lobby.
		res.render("pages/lobby", {
			adminId: game.adminId,
			gameName: game.name,
			gameCreateTime: game.createTime,
			gameId: game.id,
			yourId: userId,
			joinedPlayerNames: Object.values(game.lobby).map(lobbyMember => lobbyMember.name),
			hasJoinedGame: Object.keys(game.lobby).includes(userId)
		});
	}
}

module.exports = {
	getLandingPage,
	getGameplayOrLobbyPage
};
