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
const {MONOPOLIES, places} = require("./location-configs.js");
const {configureEmitter, emit, getMessagesForPlayer} = require("./message-box.js");
const {authLookup, players, GlobalState} = require("./startup.js");

function onConnection(io, socket) {
	console.log("a user connected");

	socket.on("disconnect", () => {
		console.log("a user disconnected");
	});

	socket.on("start-up", ({secretKey}) => {
		const player = authLookup[secretKey];
		player.configureEmitter(socket);

		const playerData = players.map(player => ({
			name: player.name,
			num: player.num,
			spriteFileName: player.spriteFileName,
			balance: player.balance,
			placeIdx: player.placeIdx,
			jailDays: player.jailDays,
			numJailCards: player.numJailCards
		}));

		const locationData = places.map((place, idx) => ({
			placeIdx: idx,
			ownerNum: place.ownerNum,
			houseCount: place.houseCount,
			isMortgaged: place.isMortgaged
		}));

		if (GlobalState.hasGameStarted) {
			// For subsequent users, or users who refreshed the page.
			const monopolies = MONOPOLIES.filter(monopoly => hasAchievedColoredMonopoly(monopoly, player.num));

			const savedMessages = getMessagesForPlayer(player.num);

			player.emit("start-up", {
				isNewGame: false,
				playerData,
				locationData,
				savedMessages,
				monopolies,
				currentPlayerId: GlobalState.currentPlayer.num,
				yourPlayerId: player.num
			});
			return;
		}

		GlobalState.hasGameStarted = true;
		// Choose starting player.
		const currentPlayerId = Math.floor(Math.random() * players.length);
		GlobalState.currentPlayer = players[currentPlayerId];

		io.emit("start-up", {
			isNewGame: true,
			playerData,
			locationData,
			savedMessages: [],
			monopolies: [],
			currentPlayerId,
			yourPlayerId: player.num
		});
	});

	// Turn actions
	socket.on("advance-turn", () => {
		advanceTurn();
	});

	socket.on("execute-turn", ({playerId}) => {
		executeTurn(players[playerId]);
	});

	// Property actions
	socket.on("respond-to-buy-offer", ({playerId, ifBuy}) => {
		respondToBuyOffer(players[playerId], ifBuy);
	});

	socket.on("buy-house", ({playerId, placeIdx}) => {
		buyHouse(players[playerId], placeIdx);
	});

	socket.on("sell-house", ({playerId, placeIdx}) => {
		sellHouse(players[playerId], placeIdx);
	});

	// Jail actions
	socket.on("use-jail-card", ({playerId}) => {
		useGetOutOfJailFreeCard(players[playerId]);
	});

	socket.on("pay-out-of-jail", ({playerId}) => {
		payOutOfJail(players[playerId]);
	});

	// Mortgage rules
	socket.on("mortgage-property", ({playerId, placeIdx}) => {
		mortgageProperty(players[playerId], placeIdx);
	});

	socket.on("unmortgage-property", ({playerId, placeIdx}) => {
		unmortgageProperty(players[playerId], placeIdx);
	});
};

module.exports = {
	onConnection
};