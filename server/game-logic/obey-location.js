const {Locations, LocationInfo, MONOPOLIES} = require("./location-configs.js");

const AdvanceToNextPlayer = false;
const WaitForUserResponse = true;

function obeyLocation(mover) {
	// On location change (from a roll, chance card, or comm chest card), follow the rules of that square.
	const place = mover.game.places[mover.placeIdx];
	if (place.price !== 0) {
		if (place.ownerNum === -1) {
			mover.emit("offer-unowned-property", {placeIdx: mover.placeIdx});
			return WaitForUserResponse;
		} else if (place.ownerNum != mover.num) {
			// Owned: pay rent to the owner.
			const owner = mover.game.players[place.ownerNum];
			const rent = determineRent(mover, owner, place);
			payRent(mover, owner, rent, place.name);
			return AdvanceToNextPlayer;
		} else {
			mover.log(`You already own ${place.name}.`);
		}
	} else {
		return obeySpecialSquare(mover);
	}
}

function determineRent(mover, owner, place) {
	if (place.isMortgaged) {
		return 0;
	}

	const propertyGroup = MONOPOLIES.find(group => group.includes(mover.placeIdx));
	const ownershipCount = propertyGroup.filter(placeIdx => mover.game.places[placeIdx].ownerNum === owner.num).length;

	switch (mover.placeIdx) {
		case Locations.ElectricCompany: case Locations.WaterWorks:
			const multiplier = (ownershipCount === 1) ? 4 : 10;
			return multiplier * (mover.latestRoll[0] + mover.latestRoll[1]);

		case Locations.ReadingRailroad:
		case Locations.PennsylvaniaRailroad:
		case Locations.BORailroad:
		case Locations.ShortLine:
			return place.rents[ownershipCount - 1];

		default:// Colored property
			if (ownershipCount < propertyGroup.length) {
				return place.rents[0];
			}
			if (place.houseCount === 0) {
				return 2 * place.rents[0];
			}
			return place.rents[place.houseCount];// e.g. 3 houses -> place.rents[3]
	}
}

function payRent(mover, owner, rent, placeName) {
	if (rent === 0) {// Due to mortgaging.
		mover.log(`You skipped rent since ${owner.name} mortgaged ${placeName}.`);
		owner.log(`${mover.name} skips rent since you mortgaged ${placeName}.`);
		return;
	}
	mover.updateBalance(-rent);
	owner.updateBalance(rent);
	mover.log(`You paid $${rent} in rent to ${owner.name}.`);
	owner.log(`${mover.name} paid $${rent} in rent to you for ${placeName}.`);
}

function obeySpecialSquare(mover) {
	switch (mover.placeIdx) {
		case Locations.Chance1: case Locations.Chance2: case Locations.Chance3:
			return obeyChanceSquare(mover);
			break;
		case Locations.CommunityChest1: case Locations.CommunityChest2: case Locations.CommunityChest3:
			return obeyCommunityChestSquare(mover);
			break;
		case Locations.IncomeTax:
			mover.updateBalance(-200);
			mover.game.tax += 200;
			mover.emitToEveryone("update-tax", {tax: mover.game.tax});
			mover.log("You paid $200 income tax.");
			break;
		case Locations.LuxuryTax:
			mover.updateBalance(-100);
			mover.game.tax += 100;
			mover.emitToEveryone("update-tax", {tax: mover.game.tax});
			mover.log("You paid $100 luxury tax.");
			break;
		case Locations.FreeParking:
			const tax = mover.game.tax;
			mover.updateBalance(tax);
			mover.game.tax = 0;
			mover.emitToEveryone("update-tax", {tax: 0});
			if (tax > 0) {
				mover.log("You collected $" + tax + " from free parking!");
			} else {
				mover.log("Sorry, there was no money to collect.");
			}
			break;
		case Locations.GoToJail:
			mover.goToJail();
			break;
	}

	return AdvanceToNextPlayer;
}

function obeyChanceSquare(mover) {
	mover.log("Chance: ");

	switch (Math.floor(Math.random() * 16)) {
		case 0:
			mover.log("Advance to Boardwalk.");
			mover.updateLocation(Locations.Boardwalk);
			return obeyLocation(mover);
			break;
		case 1:
			mover.log('Advance to "Go". (Collect $200)');
			mover.updateLocation(Locations.Go);
			mover.collectGoMoney();
			break;
		case 2:
			mover.log("Make general repairs on all your property: For each house pay $25, for each hotel pay $100.");
			const {houses, hotels} = countOwnedBuildings(mover);
			const total = 25 * houses + 100 * hotels;
			mover.log("Paid $" + total + ".");
			mover.updateBalance(-total);
			break;
		case 3:
			mover.log("Speeding fine $15.");
			mover.updateBalance(-15);
			break;
		case 4:
			mover.log('Advance to St. Charles Place. If you pass "Go" collect $200.');
			if (mover.placeIdx > Locations.StCharlesPlace) {
				mover.collectGoMoney();
			}
			mover.updateLocation(Locations.StCharlesPlace);
			return obeyLocation(mover);
			break;
		case 5:
			mover.log("Your building loan matures. Collect $150.");
			mover.updateBalance(150);
			break;
		case 6:
			mover.log("Go back three spaces.");
			mover.updateLocation(mover.placeIdx - 3);
			return obeyLocation(mover);
			break;
		case 7:
			mover.log("GET OUT OF JAIL FREE. This card may be kept until needed or traded.");
			addGetOutOfJailFreeCard(mover);
			break;
		case 8:
			mover.log("Bank pays you dividend of $50.");
			mover.updateBalance(50);
			break;
		case 9:
			mover.log('Advance to Illinois Avenue. If you pass "Go" collect $200.');
			if (mover.placeIdx > Locations.IllinoisAvenue) {
				mover.collectGoMoney();
			}
			mover.updateLocation(Locations.IllinoisAvenue);
			return obeyLocation(mover);
			break;
		case 10:
			mover.log("You have been elected chairman of the board. Pay each player $50.");
			mover.game.players.forEach(player => {
				player.updateBalance(50);
			});
			mover.updateBalance(-50 * mover.game.players.length);
			break;
		case 11:
			mover.log('Go to jail. Go directly to jail, do not pass "Go", do not collect $200.');
			mover.goToJail();
			break;
		case 12: {
			mover.log("Advance to the nearest utility. If Unowned, you may buy it from the bank. If Owned, pay owner a total ten times amount thrown on dice.");
			if (mover.placeIdx >= Locations.ElectricCompany && mover.placeIdx < Locations.WaterWorks) {
				mover.updateLocation(Locations.WaterWorks);
			} else {
				mover.updateLocation(Locations.ElectricCompany);
			}

			const game = mover.game;
			if (game.places[mover.placeIdx].ownerNum === -1) {
				return obeyLocation(mover);
			} else if (game.places[mover.placeIdx].ownerNum != mover.num) {
				const owner = game.players[game.places[mover.placeIdx].ownerNum];
				const [roll1, roll2] = mover.latestRoll;
				payRent(mover, owner, 10 * (roll1 + roll2));
			}
			break;
		}
		case 13:
			mover.log('Take a trip to Reading Railroad. If you pass "Go" collect $200.');
			if (mover.placeIdx > Locations.ReadingRailroad) {
				mover.collectGoMoney();
			}
			mover.updateLocation(Locations.ReadingRailroad);
			return obeyLocation(mover);
			break;
		case 14: case 15: {
			mover.log("Advance to the nearest railroad. If Unowned, you may buy it from the bank. If Owned, pay owner twice the rental to which they are otherwise entitled.");
			const rangeIdx = Math.floor((mover.placeIdx + 5) % 40 / 10);// What side of the board are we on if we step forward 5?
			const nearestRailroadIdx = 10 * rangeIdx + 5;// Map that side to its railroad.

			mover.updateLocation(nearestRailroadIdx);
			const game = mover.game;
			const railroad = game.places[nearestRailroadIdx];
			if (railroad.ownerNum === -1) {
				return obeyLocation(mover);
			} else if (game.players[railroad.ownerNum] != mover) {
				// Control the rent properly.
				const owner = game.players[railroad.ownerNum];
				const rent = determineRent(mover, owner, railroad);
				payRent(owner, 2 * rent);
			}
			break;
		}
	}

	return AdvanceToNextPlayer;
}

function obeyCommunityChestSquare(mover) {
	mover.log("Community Chest: ");
	switch (Math.floor(Math.random() * 16)) {
		case 0:
			mover.log("GET OUT OF JAIL FREE. This card may be kept until needed or traded.");
			addGetOutOfJailFreeCard(mover);
			break;
		case 1:
			mover.log("You have won second prize in a beauty contest. Collect $10.");
			mover.updateBalance(10);
			break;
		case 2:
			mover.log("Holiday fund matures. Receive $100.");
			mover.updateBalance(100);
			break;
		case 3:
			mover.log("Bank error in your favor. Collect $200.");
			mover.updateBalance(200);
			break;
		case 4:
			mover.log('Go to jail. Go directly to jail, do not pass "Go", do not collect $200.');
			mover.goToJail();
			break;
		case 5:
			mover.log("It is your birthday. Collect $10 from every player.");
			mover.updateBalance(10 * mover.game.players.length);
			mover.game.players.forEach(player => {
				player.updateBalance(-10);
			});
			break;
		case 6:
			mover.log("Doctor's fees. Pay $50.");
			mover.updateBalance(-50);
			break;
		case 7:
			mover.log("Pay hospital fees of $100.");
			mover.updateBalance(-100);
			break;
		case 8:
			mover.log("You inherit $100.");
			mover.updateBalance(100);
			break;
		case 9:
			mover.log("From sale of stock you get $50.");
			mover.updateBalance(50);
			break;
		case 10:
			mover.log("You are assessed for street repairs: $40 per house, $115 per hotel.");
			const {houses, hotels} = countOwnedBuildings(mover);
			const total = 40 * houses + 115 * hotels;
			mover.log("Paid $" + total + ".");
			mover.updateBalance(-total);
			break;
		case 11:
			mover.log('Advance to "Go". (Collect $200)');
			mover.updateLocation(Locations.Go);
			mover.collectGoMoney();
			break;
		case 12:
			mover.log("Income tax refund. Collect $20.");
			mover.updateBalance(20);
			break; 
		case 13:
			mover.log("Pay school fees of $50.");
			mover.updateBalance(-50);
			break;
		case 14:
			mover.log("Life insurance matures. Collect $100.");
			mover.updateBalance(100);
			break; 
		case 15:
			mover.log("Receive $25. Consultancy fee.");
			mover.updateBalance(25);
			break;
	}

	return AdvanceToNextPlayer;
}

function countOwnedBuildings(owner) {
	return owner.game.places.filter(place => place.ownerNum === owner.num)
		.reduce(({houses, hotels}, place) => {
			const houseCount = place.houseCount;
			if (houseCount === 5) {
				return {houses, hotels: hotels + 1};
			} else {
				return {houses: houses + houseCount, hotels};
			}
		}, {
			houses: 0,
			hotels: 0
		});
}

function addGetOutOfJailFreeCard(mover) {
	mover.numJailCards ++;
	mover.emitToEveryone("add-jail-card", {playerId: mover.num});
}

function useGetOutOfJailFreeCard(player) {
	player.getOutOfJail();
	player.numJailCards --;

	if (player.numJailCards === 0) {
		$("#jail-card" + player.num).text("");
	} else {
		// e.g. Get Out of Jail Free x3
		$("#jail-card-quantity" + player.num).text(" x" + player.numJailCards);
	}
}

module.exports = {
	obeyLocation
};