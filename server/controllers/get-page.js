const {PlayerIcons} = require("../models/player.js");
const {describeTimeSince} = require("../friendliness/age-to-text-helper.js");
const {summarizeGame, summarizeLobby} = require("../friendliness/summarize-game.js");
const {setNewPlayerAndCookies, httpAuthenticatePlayer} = require("../auth.js");
const Lookup = require("../storage/lookup.js");


function getLandingPage(req, res) {
	const playerIcons = PlayerIcons.map(playerIcon => playerIcon.imageSrc);

	if ("userId" in req.cookies) {
		const {userId, secretKey, landingToast} = req.cookies;
		if (!httpAuthenticatePlayer(res, userId, secretKey)) {
			return;
		}

		const user = Lookup.fetchUser(userId);

		// TODO: have page ajax-get the below info after page load
		const userGames = user.gameIds.map(gameId => Lookup.fetchGame(gameId));
		const inProgressGames = userGames.filter(game => ! game.hasCompleted).map(game => summarizeGame(game, userId));
		const completedGames = userGames.filter(game => game.hasCompleted).map(game => summarizeGame(game, userId));

		const lobbies = user.lobbyIds.map(lobbyId => summarizeLobby(Lookup.fetchLobby(lobbyId)), userId);

		res.clearCookie("landingToast");
		res.render("pages/landing", {
			inProgressGames,
			completedGames,
			lobbies,
			yourId: userId,
			playerIcons,
			landingToast: landingToast || null
		});
	} else {
		// New user.
		const userId = setNewPlayerAndCookies(res);
		res.render("pages/landing", {
			inProgressGames: [],
			completedGames: [],
			lobbies: [],
			yourId: userId,
			playerIcons,
			landingToast: null
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

	const gameOption = Lookup.fetchGame(gameId);
	if (gameOption !== undefined) {
		// Render game.
		res.render("pages/gameplay", {gameId});
		return;
	}

	const lobbyOption = Lookup.fetchLobby(gameId);
	if (lobbyOption !== undefined) {
		// Render lobby.
		const lobby = lobbyOption;
		const playerIcons = PlayerIcons.map(playerIcon => playerIcon.imageSrc);
		res.render("pages/lobby", {
			parameters: {
				lobbyId: lobby.id,
				adminId: lobby.adminId,
				gameName: lobby.name,
				gameCreateTime: {
					friendly: describeTimeSince(lobby.createTime),
					timestamp: lobby.createTime
				},
				yourId: userId,
				joinedPlayers: lobby.memberMap,
				hasJoinedGame: userId in lobby.memberMap,
				playerIcons
			}
		});
		return;
	}

	res.render("pages/404", {
		message: `Game "${gameId}" not found.`
	});
}

module.exports = {
	getLandingPage,
	getGameplayOrLobbyPage
};
