const Data = require("../storage/data.js");
const {PlayerIcons} = require("../models/player.js");
const {summarizeGame, summarizeLobby} = require("../friendliness/summarize-game.js");
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

		const lobbies = user.lobbyIds.map(lobbyId => summarizeLobby(Data.lobbies[lobbyId]), userId);

		res.render("pages/landing", {
			inProgressGames,
			completedGames,
			lobbies,
			yourId: userId,
			playerIcons: PlayerIcons
		});
	} else {
		// New user.
		const userId = setNewPlayerAndCookies(res);
		res.render("pages/landing", {
			inProgressGames: [],
			completedGames: [],
			lobbies: [],
			yourId: userId,
			playerIcons: PlayerIcons
		});
	}
}

function getGameplayOrLobbyPage(req, res) {
	let {userId, secretKey} = req.cookies;

	if (userId === undefined) {// New visitor.
		userId = setNewPlayerAndCookies(res);
	} else if (!httpAuthenticatePlayer(res, userId, secretKey)) {
		return;
	}

	const {gameId} = req.params;

	if (gameId in Data.games) {
		// Render game.
		const game = Data.games[gameId];
		res.render("pages/gameplay", {gameId});
		return;
	}

	if (gameId in Data.lobbies) {
		// Render lobby.
		const lobby = Data.lobbies[gameId];
		res.render("pages/lobby", {
			gameId: lobby.id,
			adminId: lobby.adminId,
			gameName: lobby.name,
			gameCreateTime: lobby.createTime,
			yourId: userId,
			joinedPlayerNames: Object.values(lobby.memberMap).map(lobbyMember => lobbyMember.name),
			hasJoinedGame: userId in lobby.memberMap
		});
		return;
	}

	res.render("pages/404", {
		message: `Game ${gameId} not found.`
	});
}

module.exports = {
	getLandingPage,
	getGameplayOrLobbyPage
};
