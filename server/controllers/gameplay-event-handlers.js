const Data = require("../storage/data.js");
const {Game} = require("../models/game.js");
const MemStore = require("../storage/in-memory-store.js");
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


function fetchGame(gameId) {
	if (gameId in MemStore.games) {
		// Fetch from cache.
		return MemStore.games[gameId];
	}

	// Fetch from DB, then cache.
	const gameRecord = Data.games[gameId];
	const game = new Game(gameRecord);
	MemStore.games[gameId] = game;
	return game;
}

function onGameplayConnection(gameplayIo, socket, userId) {

	let game, player;

	console.log(`${userId} opened a game`);

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
		game = fetchGame(gameId);

		player = game.players.find(_player => _player.userId === userId);

		if (player === undefined) {
			console.error(`User ${userId} does not have a player in game ${gameId}.`);
			console.error(game.players);
			return;
		}

		socket.join(gameId);

		player.configureEmitter(gameplayIo.to(gameId), socket);

		// TODO: Is `this.monopolies` a typo?
		const monopolies = this.monopolies = MONOPOLIES.filter(monopoly => hasAchievedColoredMonopoly(monopoly, player));

		const gameRecord = game.serialize();

		player.emit("start-up", {
			monopolies,
			yourPlayerId: player.num,
			playerData: gameRecord.playerData,
			locationData: gameRecord.locationData,
			currentPlayerId: gameRecord.currentPlayerId,
			tax: gameRecord.tax,
			numTurns: gameRecord.numTurns
		});

		return [player, game];
	});

	// Turn actions
	// TODO: None of these socket events need to send playerId. The issuing user is already authenticated.
	socket.on("advance-turn", () => {
		advanceTurn(player, game);
	});

	socket.on("execute-turn", ({playerId}) => {
		executeTurn(player);
	});

	// Property actions
	socket.on("respond-to-buy-offer", ({playerId, ifBuy}) => {
		respondToBuyOffer(player, ifBuy);
	});

	socket.on("buy-house", ({playerId, placeIdx}) => {
		buyHouse(player, placeIdx);
	});

	socket.on("sell-house", ({playerId, placeIdx}) => {
		sellHouse(player, placeIdx);
	});

	// Jail actions
	socket.on("use-jail-card", ({playerId}) => {
		useGetOutOfJailFreeCard(player);
	});

	socket.on("pay-out-of-jail", ({playerId}) => {
		payOutOfJail(player);
	});

	// Mortgage rules
	socket.on("mortgage-property", ({playerId, placeIdx}) => {
		mortgageProperty(player, placeIdx);
	});

	socket.on("unmortgage-property", ({playerId, placeIdx}) => {
		unmortgageProperty(player, placeIdx);
	});
};

module.exports = {
	onGameplayConnection
};