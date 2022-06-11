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
const {
	sendTradeOffer,
	acceptTradeOffer,
	declineTradeOffer
} = require("../game-logic/trade.js");
const {LocationInfo, MONOPOLIES} = require("../game-logic/location-configs.js");
const Lookup = require("../storage/lookup.js");


function onGameplayConnection(socket, userId) {

	let game = undefined;
	let player = undefined;

	socket.on("disconnect", () => {
		console.log(`${userId} closed game ${game ? game.id : ""}`);
		if (player !== undefined) {
			player.removeSocket(socket);
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
			console.error(`Valid players: ${game.players.map(player => player.userId)}`);
			return;
		}

		console.log(`${userId} opened game ${gameId}`);

		socket.join(gameId);

		player.addSocket(socket);

		const monopolies = MONOPOLIES.filter(monopoly => hasAchievedColoredMonopoly(monopoly, player));
		const tradeOffers = Lookup.fetchTradeOffersTo(player.num, gameId);

		const gameRecord = game.serialize();

		player.emit("start-up", {
			gameName: game.name,
			monopolies,
			yourPlayerId: player.num,
			playerData: gameRecord.playerData,
			locationData: gameRecord.placeRecords,
			currentPlayerId: gameRecord.currentPlayerId,
			tax: gameRecord.tax,
			numTurns: gameRecord.numTurns,
			tradeOffers
		});

		return [player, game];
	});

	// Turn actions
	socket.on("advance-turn", () => {
		if (player !== undefined) {
			advanceTurn(player, game);
		}
	});

	socket.on("execute-turn", () => {
		if (player !== undefined) {
			executeTurn(player);
		}
	});

	// Property actions
	socket.on("respond-to-buy-offer", ({ifBuy}) => {
		if (player !== undefined) {
			respondToBuyOffer(player, ifBuy);
		}
	});

	socket.on("buy-house", ({placeIdx}) => {
		if (player !== undefined) {
			buyHouse(player, placeIdx);
		}
	});

	socket.on("sell-house", ({placeIdx}) => {
		if (player !== undefined) {
			sellHouse(player, placeIdx);
		}
	});

	// Jail actions
	socket.on("use-jail-card", () => {
		if (player !== undefined) {
			useGetOutOfJailFreeCard(player);
		}
	});

	socket.on("pay-out-of-jail", () => {
		if (player !== undefined) {
			payOutOfJail(player);
		}
	});

	// Mortgage rules
	socket.on("mortgage-property", ({placeIdx}) => {
		if (player !== undefined) {
			mortgageProperty(player, placeIdx);
		}
	});

	socket.on("unmortgage-property", ({placeIdx}) => {
		if (player !== undefined) {
			unmortgageProperty(player, placeIdx);
		}
	});

	socket.on("send-trade-offer", ({trade}) => {
		if (player !== undefined) {
			sendTradeOffer(player, trade);
		}
	});

	socket.on("accept-trade-offer", ({tradeId}) => {
		if (player !== undefined) {
			acceptTradeOffer(player, tradeId);
		}
	});

	socket.on("decline-trade-offer", ({tradeId}) => {
		if (player !== undefined) {
			declineTradeOffer(player, tradeId);
		}
	});
};

module.exports = {
	onGameplayConnection
};