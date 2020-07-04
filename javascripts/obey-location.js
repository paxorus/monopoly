function action(mover) {
    // On location change (from a roll, chance card, or comm chest card), follow the rules of that square.
    GlobalState.waitingForUserResponse = false;
    const place = places[mover.locnum];
    if (place.p !== 0) {
        if (place.own === -1) {
            offerUnownedProperty(mover, place);
        } else if (place.own != mover.num) {
            // Owned: pay rent to the owner.
            const owner = players[place.own];
            const rent = determineRent(mover, owner, place);
            payRent(mover, owner, rent);
        }
    } else {
        obeySpecialSquare(mover);
    }
    
    if (!GlobalState.waitingForUserResponse && shouldRollAgain(mover)) {
        rollMove(mover);
    }
}

function determineRent(mover, owner, place) {
    if (place.isMortgaged) {
        return 0;
    }

    const propertyGroup = MONOPOLIES.find(group => group.includes(mover.locnum));
    const ownershipCount = propertyGroup.filter(placeIdx => places[placeIdx].own === owner.num).length;

    switch (mover.locnum) {
        case 12: case 28:// Utilities
            const multiplier = (ownershipCount === 1) ? 4 : 10;
            return multiplier * (mover.latestRoll[0] + mover.latestRoll[1]);
        case 5: case 15: case 25: case 35:// Railroads
            return [place.re0, place.re1, place.re2, place.re3][ownershipCount - 1];
        default:// Colored property
            if (ownershipCount < propertyGroup.length) {
                return place.re0;
            }
            if (place.houseCount === 0) {
                return 2 * place.re0;
            }
            return place["re" + place.houseCount];// e.g. 3 houses -> place.re3
    }
}

function offerUnownedProperty(mover, place) {
    log(mover.name + ", would you like to buy " + place.name + " for $" + place.p + "?");
    $("#button-box").append("<div class='button' onclick='react(true)'>Buy " + place.name + "</div>");
    $("#button-box").append("<div class='button-negative' onclick='react(false)'>No Thanks</div>");
    GlobalState.waitingForUserResponse = true;
}

function obeySpecialSquare(mover) {
    switch (mover.locnum) {
        case 7: case 22: case 36:
            obeyChanceSquare(mover);
            break;
        case 2: case 17: case 33:
            obeyCommunityChestSquare(mover);
            break;
        case 4:// Income tax
            mover.updateBalance(-200);
            GlobalState.tax += 200;
            log("You paid $200 income tax.");
            break;
        case 38:// Luxury tax
            mover.updateBalance(-100);
            GlobalState.tax += 100;
            log("You paid $100 luxury tax.");
            break;
        case 20:// Free parking
            const tax = GlobalState.tax;
            mover.updateBalance(tax);
            GlobalState.tax = 0;
            log("You collected $" + tax + " from free parking!");
            break;
        case 30:// Go to jail
            mover.goToJail();
            break;
    }
}

function obeyChanceSquare(mover) {
    log("Chance: ");

    switch (Math.floor(Math.random() * 16)) {
        case 0:
            log("Advance to Boardwalk.");
            mover.updateLocation(39);
            action(mover);
            break;
        case 1:
            log('Advance to "Go". (Collect $200)');
            mover.updateLocation(0);
            mover.updateBalance(200);
            break;
        case 2:
            log("Make general repairs on all your property: For each house pay $25, for each hotel pay $100.");
            const {houses, hotels} = countOwnedBuildings(mover);
            const total = 25 * houses + 100 * hotels;
            log("Paid $" + total + ".");
            mover.updateBalance(-total);
            break;
        case 3:
            log("Speeding fine $15.");
            mover.updateBalance(-15);
            break;
        case 4:
            log('Advance to St. Charles Place. If you pass "Go" collect $200.');
            if (mover.locnum > 11) {
                mover.updateBalance(200);
            }
            mover.updateLocation(11);
            action(mover);
            break;
        case 5:
            log("Your building loan matures. Collect $150.");
            mover.updateBalance(150);
            break;
        case 6:
            log("Go back three spaces.");
            mover.updateLocation(mover.locnum - 3);
            action(mover);
            break;
        case 7:
            log("GET OUT OF JAIL FREE. This card may be kept until needed or traded.");
            addGetOutOfJailFreeCard(mover);
            break;
        case 8:
            log("Bank pays you dividend of $50.");
            mover.updateBalance(50);
            break;
        case 9:
            log('Advance to Illinois Avenue. If you pass "Go" collect $200.');
            if (mover.locnum > 24) {
                mover.updateBalance(200);
            }
            mover.updateLocation(24);
            action(mover);
            break;
        case 10:
            log("You have been elected chairman of the board. Pay each player $50.");
            players.forEach(player => {
                player.updateBalance(50);
            });
            mover.updateBalance(-50 * players.length);
            break;
        case 11:
            log('Go to jail. Go directly to jail, do not pass "Go", do not collect $200.');
            mover.goToJail();
            break;
        case 12:
            log("Advance to the nearest utility. If Unowned, you may buy it from the bank. If Owned, pay owner a total ten times amount thrown on dice.");
            if (mover.locnum >= 12 && mover.locnum < 28) {
                mover.updateLocation(28);
            } else {
                mover.updateLocation(12);
            }
            if (places[mover.locnum].own === -1) {
                action(mover);
            } else if (places[mover.locnum].own != mover.num) {
                const owner = players[places[mover.locnum].own];
                const [roll1, roll2] = mover.latestRoll;
                payRent(mover, owner, 10 * (roll1 + roll2));
            }
            break;
        case 13:
            log('Take a trip to Reading Railroad. If you pass "Go" collect $200.');
            if (mover.locnum > 5) {
                mover.updateBalance(200);
            }
            mover.updateLocation(5);
            break;
        case 14: case 15:
            log("Advance to the nearest railroad. If Unowned, you may buy it from the bank. If Owned, pay owner twice the rental to which they are otherwise entitled.");
            const rangeIdx = Math.floor((mover.locnum + 5) % 40 / 10);// What side of the board are we on if we step forward 5?
            const nearestRailroadIdx = 10 * rangeIdx + 5;// Map that side to its railroad.

            mover.updateLocation(nearestRailroadIdx);
            const railroad = places[nearestRailroadIdx];
            if (railroad.own === -1) {
                action(mover);
            } else if (players[railroad.own] != mover) {
                // Control the rent properly.
                const owner = players[railroad.own];
                const rent = determineRent(mover, owner, place);
                payRent(owner, 2 * rent);
            }
            break;
    }
}

function obeyCommunityChestSquare(mover) {
    log("Community Chest: ");
    switch (Math.floor(Math.random() * 16)) {
        case 0:
            log("GET OUT OF JAIL FREE. This card may be kept until needed or traded.");
            addGetOutOfJailFreeCard(mover);
            break;
        case 1:
            log("You have won second prize in a beauty contest. Collect $10.");
            mover.updateBalance(10);
            break;
        case 2:
            log("Holiday fund matures. Receive $100.");
            mover.updateBalance(100);
            break;
        case 3:
            log("Bank error in your favor. Collect $200.");
            mover.updateBalance(200);
            break;
        case 4:
            log('Go to jail. Go directly to jail, do not pass "Go", do not collect $200.');
            mover.goToJail();
            break;
        case 5:
            log("It is your birthday. Collect $10 from every player.");
            mover.updateBalance(10 * players.length);
            players.forEach(player => {
                player.updateBalance(-10);
            });
            break;
        case 6:
            log("Doctor's fees. Pay $50.");
            mover.updateBalance(-50);
            break;
        case 7:
            log("Pay hospital fees of $100.");
            mover.updateBalance(-100);
            break;
        case 8:
            log("You inherit $100.");
            mover.updateBalance(100);
            break;
        case 9:
            log("From sale of stock you get $50.");
            mover.updateBalance(50);
            break;
        case 10:
            log("You are assessed for street repairs: $40 per house, $115 per hotel.");
            const {houses, hotels} = countOwnedBuildings(mover);
            const total = 40 * houses + 115 * hotels;
            log("Paid $" + total + ".");
            mover.updateBalance(-total);
            break;
        case 11:
            log('Advance to "Go". (Collect $200)');
            mover.updateLocation(0);
            mover.updateBalance(200);
            break;
        case 12:
            log("Income tax refund. Collect $20.");
            mover.updateBalance(20);
            break; 
        case 13:
            log("Pay school fees of $50.");
            mover.updateBalance(-50);
            break;
        case 14:
            log("Life insurance matures. Collect $100.");
            mover.updateBalance(100);
            break; 
        case 15:
            log("Receive $25. Consultancy fee.");
            mover.updateBalance(25);
            break;
    }
}

function countOwnedBuildings(owner) {
    return places.filter(place => place.own === owner.num)
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