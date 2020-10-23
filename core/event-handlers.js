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
const {MONOPOLIES} = require("./location-configs.js");
const {authLookup} = require("./startup.js");

function onConnection(io, socket, userId) {

	let game, player;

	console.log("a user connected");

	socket.on("disconnect", () => {
		console.log("a user disconnected");
	});

	socket.on("start-up", ({gameId}) => {
		// Look up (game, user).
		game = Data.games[gameId];
		player = game.players.find(_player => _player.userId === userId);

		if (player === undefined) {
			console.error(`User ${userId} does not have a player in game ${gameId}.`);
			console.error(game.players);
			return;
		}

		socket.join(gameId);
		// TODO: Message all of the player's devices, not just the latest.
		player.configureEmitter(io.to(gameId), socket);

		// Send the serializable subset of Player.
		const playerData = game.players.map(player => ({
			name: player.name,
			num: player.num,
			spriteFileName: player.spriteFileName,
			balance: player.balance,
			placeIdx: player.placeIdx,
			jailDays: player.jailDays,
			numJailCards: player.numJailCards,
			savedMessages: player.savedMessages
		}));

		const monopolies = MONOPOLIES.filter(monopoly => hasAchievedColoredMonopoly(monopoly, player));

		player.emit("start-up", {
			playerData,
			locationData: game.places,
			monopolies,
			currentPlayerId: game.currentPlayerId,
			yourPlayerId: player.num,
			tax: game.tax
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