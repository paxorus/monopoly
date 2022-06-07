const Lookup = require("./lookup.js");


function sendTradeOffer(fromPlayer, trade) {
	// TODO: Make a TradeRecord and handle validation in there.
	if (!isValid(fromPlayer, trade)) {
		return;
	}

	trade = {
		name: "Offer 3",
		message: "Kindly accept my offer, you worthless dishrag.",
		createTime: 1.55e12,
		fromPlayerId: 1,
		toPlayerId: 0,
		fromProperties: [37, 39],
		toProperties: [1],
		cash: 100,
		numJailCards: -1
	};

	Lookup.createTradeOffer(trade);

	const toPlayer = fromPlayer.game.players[trade.toPlayerId];
	toPlayer.emit("send-trade-offer", {trade});
	toPlayer.log(`${fromPlayer.name} has sent you a trade offer!`);
}

function acceptTradeOffer(toPlayer, tradeId) {
	// Check it's still valid.
	const trade = Lookup.fetchTradeOffer(tradeId);
	if (isValid(toPlayer, trade)) {
		executeTradeOffer(toPlayer, trade);
		toPlayer.emitToAll("execute-trade-offer", {trade});
	} else {
		toPlayer.log(`Offer ${trade.name} is no longer valid.`);
	}

	Lookup.deleteTradeOffer(tradeId);
}

function rejectTradeOffer(toPlayer, tradeId) {
	const trade = Lookup.fetchTradeOffer(tradeId);
	if (toPlayer.num !== trade.toPlayerId) {
		return;
	}

	toPlayer.emitToAll("reject-trade-offer", {
		tradeId,
		trade.fromPlayerId,
		trade.toPlayerId
	});

	Lookup.deleteTradeOffer(tradeId);
}

function executeTradeOffer(trade, toPlayer) {
	const fromPlayer = toPlayer.game.players[trade.fromPlayerId];

	// For each transfer, a unit test that we notify all players, _and_ update in-memory.

	// Transfer cash.
	fromPlayer.updateBalance(-trade.cash);
	toPlayer.updateBalance(trade.cash);

	// Transfer properties.
	trade.fromProperties.forEach(placeIdx => {
		toPlayer.emitToEveryone("update-property-owner", {playerId: toPlayer.num, placeIdx});
	});
	trade.toProperties.forEach(placeIdx => {
		fromPlayer.emitToEveryone("update-property-owner", {playerId: fromPlayer.num, placeIdx});
	});

	// Transfer jail cards.
	fromPlayer.numJailCards -= trade.numJailCards;
	toPlayer.numJailCards += trade.numJailCards;

	for (let i = 0; i < trade.numJailCards; i ++) {
		fromPlayer.emitToEveryone("use-jail-card", {playerId: fromPlayer.num});
		toPlayer.emitToEveryone("add-jail-card", {playerId: toPlayer.num});
	}
}

function isTradeValid(fromPlayer, trade) {
	return true;
}

module.exports = {
	sendTradeOffer,
	acceptTradeOffer,
	rejectTradeOffer
};