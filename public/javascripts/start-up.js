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

function startUp({isNewGame, playerData, locationData, savedMessages, monopolies, yourPlayerId, currentPlayerId, tax}) {

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

	locationData.forEach(({placeIdx, ownerNum, houseCount, isMortgaged}) => {
		if (ownerNum === -1 || ownerNum === undefined) {
			return;
		}

		const owner = players[ownerNum];

		purchaseProperty(owner, placeIdx);

		for (let i = 0; i < houseCount; i ++) {
			buyHouse(ownerNum, placeIdx);
		}

		if (isMortgaged) {
			mortgageProperty(owner, placeIdx);
		}
	});

	// Add house buttons for any monopolies.
	monopolies.forEach(monopoly => {
		monopoly.forEach(placeIdx => {
			buildHouseButtons(placeIdx);
		});
	});

	if (savedMessages.length === 0) {// If it's the first turn
		if (yourPlayerId === currentPlayerId) {
			$("#initial-interactive").css("display", "block");
		} else {
			$("#waiting-on-player").css("display", "block");
			$("#current-player-name").text(players[currentPlayerId].name);
		}
	} else {
		$("#interactive").css("display", "block");
		savedMessages
			.filter(([eventName, message]) => eventName === "log")
			.forEach(([eventName, message]) => log(message));

		const [finalEventName, finalMessage] = savedMessages[savedMessages.length - 1];
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