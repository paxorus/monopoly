const Data = require("./data.js");
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
} = require("./execute-turn.js");
const {LocationInfo, MONOPOLIES} = require("./location-configs.js");
const {Player} = require("./player.js");
const {authLookup} = require("./startup.js");

function onConnection(io, socket, userId) {

	let game, player;

	console.log("a user connected");

	socket.on("disconnect", () => {
		console.log("a user disconnected");
		if (player !== undefined) {
			player.configureEmitter(null, null);			
		}
	});

	socket.on("start-up", ({gameId}) => {
		// Look up (game, user).
		game = Data.games[gameId];
		game.players = game.playerData.map(playerRecord => new Player(playerRecord, game));
		player = game.players.find(_player => _player.userId === userId);

		if (player === undefined) {
			console.error(`User ${userId} does not have a player in game ${gameId}.`);
			console.error(game.playerData);
			return;
		}

		socket.join(gameId);
		// TODO: Message all of the player's devices, not just the latest.
		player.configureEmitter(io.to(gameId), socket);

		const placeStateMap = Object.fromEntries(game.locationData.map(placeState => [placeState.placeIdx, placeState]));
		game.places = LocationInfo.map((placeConfig, placeIdx) =>
			placeConfig.price > 0 ? {
				...placeStateMap[placeIdx],
				...placeConfig
			} : placeConfig
		);

		const monopolies = MONOPOLIES.filter(monopoly => hasAchievedColoredMonopoly(monopoly, player));

		player.emit("start-up", {
			playerData: game.playerData,
			locationData: game.locationData,
			monopolies,
			currentPlayerId: game.currentPlayerId,
			yourPlayerId: player.num,
			tax: game.tax,
			numTurns: game.numTurns
		});
	});

	// Turn actions
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
	onConnection
};