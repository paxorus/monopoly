import {
	addGetOutOfJailFreeCard,
	allowConcludeTurn,
	buildHouseButtons,
	buyHouse,
	mortgageProperty,
	offerPayOutOfJail,
	offerUnownedProperty,
	purchaseProperty,
	updateTurn
} from "./execute-turn.js";
import {buildAllViews, GlobalState} from "./game-board.js";
import {log} from "./message-box.js";
import Player from "./player.js";

function startUp({playerData, locationData, monopolies, yourPlayerId, currentPlayerId, tax, numTurns}) {

	const players = playerData.map(({name, num, spriteFileName, balance}) => {
		const player = new Player(name, num, spriteFileName);
		player.balance = balance;
		return player;
	});

	GlobalState.me = players[yourPlayerId];
	GlobalState.players = players;
	GlobalState.tax = tax;

	buildAllViews(players);

	playerData.forEach(({placeIdx, jailDays, numJailCards}, idx) => {
		const player = players[idx];

		if (jailDays > 0) {
			player.goToJail();
			player.updateJailDays(jailDays);
		} else {
			player.updateLocation(placeIdx);
		}

		for (let i = 0; i < numJailCards; i ++) {
			addGetOutOfJailFreeCard(player);
		}
	});

	const monopolyPlaces = new Set(monopolies.flatMap(monopoly => monopoly));

	locationData.forEach(({placeIdx, ownerNum, houseCount, isMortgaged}) => {
		if (ownerNum === -1 || ownerNum === undefined) {
			return;
		}

		const owner = players[ownerNum];

		purchaseProperty(owner, placeIdx);

		// Add house buttons for any monopolies.
		if (monopolyPlaces.has(placeIdx)) {
			buildHouseButtons(placeIdx);			
		}

		for (let i = 0; i < houseCount; i ++) {
			buyHouse(ownerNum, placeIdx);
		}

		if (isMortgaged) {
			mortgageProperty(owner, placeIdx);
		}
	});

	// TODO: Display other users' actions.

	if (numTurns === 0) {// If it's the first turn
		if (yourPlayerId === currentPlayerId) {
			// "Start Game"
			$("#initial-interactive").css("display", "block");
		} else {
			// "It's _'s turn."
			$("#waiting-on-player").css("display", "block");
			$("#current-player-name").text(players[currentPlayerId].name);
		}
	} else {
		$("#interactive").css("display", "block");

		const savedMessages = playerData[yourPlayerId].savedMessages;

		savedMessages
			.filter(([eventName, message]) => eventName === "dialog" || eventName === "notify")
			.forEach(([eventName, message]) => log(message));

		// If the last message was a call-to-action, repeat it. There is at least
		// one saved message if a player has clicked "Start Game", which is the
		// initial "advance-turn" message indicating the previous player has gone.
		const interactions = savedMessages.filter(([eventName, message]) => eventName !== "notify");
		const [finalEventName, finalMessage] = interactions[interactions.length - 1];
		switch (finalEventName) {
			// Offers
			case "allow-conclude-turn":
				allowConcludeTurn();
				break;

			case "offer-pay-out-of-jail":
				offerPayOutOfJail();
				break;

			case "offer-unowned-property":
				offerUnownedProperty(GlobalState.me, finalMessage.placeIdx);
				break;

			case "advance-turn":
				updateTurn(finalMessage.nextPlayerId);
				break;
		}

	}
}

export {
	startUp
};