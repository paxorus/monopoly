import {buildAllViews, GlobalState} from "./game-board.js";
import {addGetOutOfJailFreeCard, buildHouseButtons, buyHouse, mortgageProperty, purchaseProperty} from "./execute-turn.js";
import Player from "./player.js";

function startUp({playerData, locationData, monopolies, yourPlayerNum, startingPlayerNum}) {

	const players = playerData.map(({name, num, spriteFileName, balance}) => {
		const player = new Player(name, num, spriteFileName);
		player.balance = balance;
		return player;
	});

	GlobalState.me = players[yourPlayerNum];
	GlobalState.players = players;

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

	// TODO: only if it's the first turn
	if (yourPlayerNum === startingPlayerNum) {
		$("#initial-interactive").css("display", "block");
	} else {
		$("#waiting-on-player").css("display", "block");
		$("#current-player-name").text(players[startingPlayerNum].name);
	}

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
}

export {
	startUp
};