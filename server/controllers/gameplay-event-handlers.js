const {
	advanceTurn,
	buyHouse,
	executeTurn,
	hasAchievedColoredMonopoly,
	mortgageProperty,
	payOutOfJail,
	respondToBuyOffer,
	sellHouse,
	unmortgageProperty,
	useGetOutOfJailFreeCard
} = require("../game-logic/execute-turn.js");
const {LocationInfo, MONOPOLIES} = require("../game-logic/location-configs.js");
const Lookup = require("../storage/lookup.js");


function onGameplayConnection(gameplayIo, socket, userId) {

	let game = undefined;
	let player = undefined;

	// console.log(`${userId} opened a game`);

	socket.on("disconnect", () => {
		console.log(`${userId} closed a game`);
		if (player !== undefined) {
			player.removeEmitter(socket);
		}
	});

	/**
	 * When user loads gameplay page.
	 */
	socket.on("start-up", ({gameId}) => {
		// Look up game and player by (game ID, user ID).
		game = Lookup.fetchGame(gameId);

		if (game === undefined) {
			console.error(`Game ${gameId} does not exist.`);
			return;
		}

		player = game.players.find(_player => _player.userId === userId);

		if (player === undefined) {
			console.error(`User ${userId} does not have a player in game ${gameId}.`);
			console.error(game.players.map(player => player.userId));
			return;
		}

		socket.join(gameId);

		player.configureEmitter(gameplayIo.to(gameId), socket);

		const monopolies = MONOPOLIES.filter(monopoly => hasAchievedColoredMonopoly(monopoly, player));

		const gameRecord = game.serialize();

		player.emit("start-up", {
			monopolies,
			yourPlayerId: player.num,
			playerData: gameRecord.playerData,
			locationData: gameRecord.placeRecords,
			currentPlayerId: gameRecord.currentPlayerId,
			tax: gameRecord.tax,
			numTurns: gameRecord.numTurns
		});

		return [player, game];
	});

	// Turn actions
	// TODO: None of these socket events need to send playerId. The issuing user is already authenticated.
	socket.on("advance-turn", () => {
		if (player !== undefined) {
			advanceTurn(player, game);
		}
	});

	socket.on("execute-turn", ({playerId}) => {
		if (player !== undefined) {
			executeTurn(player);
		}
	});

	// Property actions
	socket.on("respond-to-buy-offer", ({playerId, ifBuy}) => {
		if (player !== undefined) {
			respondToBuyOffer(player, ifBuy);
		}
	});

	socket.on("buy-house", ({playerId, placeIdx}) => {
		if (player !== undefined) {
			buyHouse(player, placeIdx);
		}
	});

	socket.on("sell-house", ({playerId, placeIdx}) => {
		if (player !== undefined) {
			sellHouse(player, placeIdx);
		}
	});

	// Jail actions
	socket.on("use-jail-card", ({playerId}) => {
		if (player !== undefined) {
			useGetOutOfJailFreeCard(player);
		}
	});

	socket.on("pay-out-of-jail", ({playerId}) => {
		if (player !== undefined) {
			payOutOfJail(player);
		}
	});

	// Mortgage rules
	socket.on("mortgage-property", ({playerId, placeIdx}) => {
		if (player !== undefined) {
			mortgageProperty(player, placeIdx);
		}
	});

	socket.on("unmortgage-property", ({playerId, placeIdx}) => {
		if (player !== undefined) {
			unmortgageProperty(player, placeIdx);
		}
	});
};

module.exports = {
	onGameplayConnection
};