const {propertyComparator, LocationInfo, MONOPOLIES, Railroads, Utilities} = require("./location-configs.js");
const {obeyLocation} = require("./obey-location.js");

function rollDice() {
	return Math.ceil(6 * Math.random());
}

function concludeTurn(mover) {
	// Show "End Turn" button.
	mover.emit("allow-conclude-turn");
}

function advanceTurn(mover, game) {
	const nextPlayerId = (game.currentPlayerId + 1) % game.players.length;
	game.currentPlayerId = nextPlayerId;
	game.lastUpdateTime = +new Date();
	game.numTurns ++;
	mover.emitToAll("advance-turn", {
		nextPlayerId
	});
}

function executeTurn(mover) {
	if (mover.jailDays > 0) {
		executeTurnInJail(mover);
	} else {
		mover.rollCount = 0;// Limited to 3 by jail.
		rollMove(mover);
	}
}

function executeTurnInJail(mover) { 
	mover.decrementJailDays();

	// No need to roll if 1 day left, turn's up anyways.
	if (mover.jailDays === 0) {
		mover.getOutOfJail();
		mover.log("Your jail sentence is up. You're free to go!")
		concludeTurn(mover);
		return;
	}

	const roll1 = rollDice();
	const roll2 = rollDice();
	mover.log("You rolled " + roll1 + " and " + roll2 + ".");
	if (roll1 === roll2) {
		mover.log("A double! You're free!");
		mover.getOutOfJail();
		concludeTurn(mover);
		return;
	}

	mover.emit("offer-pay-out-of-jail");
}

function payOutOfJail(player) {
	player.getOutOfJail();
	player.updateBalance(-50);
	player.emit("allow-conclude-turn");
}

function shouldRollAgain(mover) {
	const [roll1, roll2] = mover.latestRoll;

	if (roll1 != roll2) {
		concludeTurn(mover);
		return false;
	} else if (mover.rollCount == 3) {
		mover.log("A 3rd double! Troll alert! You're going to jail.");
		mover.goToJail();
		concludeTurn(mover);
		return false;
	} else if (mover.jailDays > 0) {
		concludeTurn(mover);
		return false;
	}

	mover.log("A double!");
	return true;
}

function rollMove(mover) {
	const roll1 = rollDice();
	const roll2 = rollDice();
	mover.latestRoll = [roll1, roll2];
	mover.rollCount ++;
	mover.log("You rolled a " + roll1 + " and a " + roll2 + ".");

	let newLocationIdx = mover.placeIdx + roll1 + roll2;
	if (newLocationIdx > 39) {
		// Pass Go.
		newLocationIdx -= 40;
		mover.updateBalance(200);
	}
	mover.updateLocation(newLocationIdx);

	mover.log("You landed on " + LocationInfo[newLocationIdx].name + ".");
	const shouldWaitForUserResponse = obeyLocation(mover);

	if (!shouldWaitForUserResponse && shouldRollAgain(mover)) {
		rollMove(mover);
	}
}

function respondToBuyOffer(mover, ifBuy) {
	if (ifBuy) {
		purchaseProperty(mover, mover.placeIdx);
	} else {
		mover.log(LocationInfo[mover.placeIdx].name + " went unsold.");
	}
	if (shouldRollAgain(mover)) {
		rollMove(mover);
	}
}

function purchaseProperty(mover, placeIdx) {
	const place = mover.game.places[placeIdx];

	mover.updateBalance(-place.price);
	place.ownerNum = mover.num;
	mover.log("Congratulations, " + mover.name + "! You now own " + place.name + "!");
	mover.emitToAll("purchase-property", {playerId: mover.num, placeIdx});

	// Check for a new monopoly.
	const monopoly = MONOPOLIES.find(monopoly => monopoly.includes(placeIdx));
	if (hasAchievedColoredMonopoly(monopoly, mover)) {
		const propertyNames = monopoly.map(placeIdx => LocationInfo[placeIdx].name);
		mover.log("Monopoly! You may now build houses on " + concatenatePropertyNames(propertyNames)
			+ ", and their rents have doubled.");
		monopoly.forEach(placeIdx => mover.emit("build-house-buttons", {placeIdx}));
	}
}

function hasAchievedColoredMonopoly(monopoly, player) {
	return monopoly !== undefined
		&& monopoly !== Railroads && monopoly !== Utilities
		&& monopoly.every(placeIdx => player.game.places[placeIdx].ownerNum === player.num);
}

function concatenatePropertyNames(names) {
	if (names.length === 3) {
		return names[0] + ", " + names[1] + ", and " + names[2];
	} else {
		return names[0] + " and " + names[1];
	}
}

function buyHouse(owner, placeIdx) {
	const place = owner.game.places[placeIdx];

	// Button disabled.
	if (place.houseCount === 5 || place.isMortgaged) {
		return;
	}

	owner.updateBalance(-place.housePrice);
	place.houseCount ++;

	if (place.houseCount === 5) {
		owner.log("Upgraded to a hotel on " + place.name + ".");
	} else {
		owner.log("Built a house on " + place.name + ".");
	}

	owner.emit("buy-house", {playerId: owner.num, placeIdx});
}

function sellHouse(owner, placeIdx) {
	const place = owner.game.places[placeIdx];

	// Button disabled.
	if (place.houseCount === 0) {
		return;
	}

	// Selling a house only returns half the cost.
	owner.updateBalance(place.housePrice / 2);
	place.houseCount --;

	if (place.houseCount === 4) {
		owner.log("Downgraded from a hotel on " + place.name + ".");
	} else {
		owner.log("Removed a house from " + place.name + ".");
	}

	owner.emit("sell-house", {playerId: owner.num, placeIdx});
}

function useGetOutOfJailFreeCard(player) {
	if (player.jailDays === 0 || player.numJailCards === 0) {
		return;
	}

	player.getOutOfJail();
	player.emitToAll("use-jail-card", {playerId: player.num})
}

function mortgageProperty(player, placeIdx) {
	const place = player.game.places[placeIdx];
	place.isMortgaged = true;
	player.updateBalance(place.price / 2);
	player.log(`Mortgaged ${place.name} for $${place.price / 2}.`);
	player.emitToAll("mortgage-property", {playerId: player.num, placeIdx});
}

function unmortgageProperty(player, placeIdx) {
	const place = player.game.places[placeIdx];
	place.isMortgaged = false;
	player.updateBalance(- place.price / 2);
	player.log(`Unmortgaged ${place.name} for $${place.price / 2}.`);
	player.emitToAll("unmortgage-property", {playerId: player.num, placeIdx});
}

module.exports = {
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
};