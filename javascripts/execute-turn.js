function rollDice() {
    return Math.ceil(6 * Math.random());
}

function concludeTurn() {
    // Show "Next Turn" button.
    $("#execute-next-turn").css("display", "block");
}

function executeTurn() {
    // Advance to next player.
    GlobalState.currentPlayer = players[(GlobalState.currentPlayer.num + 1) % players.length];
    const mover = GlobalState.currentPlayer;

    // Switch to the normal interactive; only applicable on the first turn.
    $("#initial-interactive").css("display", "none");
    $("#interactive").css("display", "block");

    // Set up the message box.
    $("#execute-next-turn").css("display", "none");
    MessageBox.clear();
    log("It's " + mover.name + "'s turn.");

    if (mover.jailDays > 0) {
        executeTurnInJail(mover);
    } else {
        mover.rollCount = 0;// Limited to 3 by jail.
        rollMove(mover);
    }
}

function executeTurnInJail(mover) { 
    mover.jailDays --;

    // No need to roll if 1 day left, turn's up anyways.
    if (mover.jailDays === 0) {
        mover.getOutOfJail();
        log("Your jail sentence is up. You're free to go!")
        concludeTurn();
        return;
    }

    const roll1 = rollDice();
    const roll2 = rollDice();
    log("You rolled " + roll1 + " and " + roll2 + ".");
    if (roll1 === roll2) {
        log("A double! You're free!");
        mover.getOutOfJail();
        concludeTurn();
        return;
    }

    const turns = (mover.jailDays > 1) ? "turns" : "turn";
    log("No double... " + mover.name + ", you have " + mover.jailDays + " " + turns + " remaining on your sentence.");
    log(mover.name + ", would you like to pay $50 to get out of jail?");
    $("#button-box").append("<div class='button' onclick='respondPayOutOfJail(true)'>Pay $50</div>");
    $("#button-box").append("<div class='button-negative' onclick='respondPayOutOfJail(false)'>No Thanks</div>");
}

function shouldRollAgain(mover) {
    const [roll1, roll2] = mover.latestRoll;

    if (roll1 != roll2) {
        concludeTurn();
        return false;
    } else if (mover.rollCount == 3) {
        log("A 3rd double! Troll alert! You're going to jail.");
        mover.goToJail();
        concludeTurn();
        return false;
    } else if (mover.jailDays > 0) {
        concludeTurn();
        return false;
    }

    log("A double!");
    return true;
}

function rollMove(mover) {
    const roll1 = rollDice();
    const roll2 = rollDice();
    mover.latestRoll = [roll1, roll2];
    mover.rollCount ++;
    log("You rolled a " + roll1 + " and a " + roll2 + ".");

    let newLocation = mover.locnum + roll1 + roll2;
    if (newLocation > 39) {
        // Pass Go.
        newLocation -= 40;
        mover.updateBalance(200);
    }
    mover.updateLocation(newLocation);

    log("You landed on " + places[newLocation].name + ".");
    action(mover);
}

function react(ifBuy) {
    // Hide the Buy/No buttons.
    $("#button-box").children().remove();

    const mover = GlobalState.currentPlayer;

    if (ifBuy) {
        purchaseProperty(mover, mover.locnum);
    } else {
        log(places[mover.locnum].name + " went unsold.");
    }
    if (shouldRollAgain(mover)) {
        rollMove(mover);
    }
}

function payRent(mover, owner, rent) {
    if (rent === 0) {// Due to mortgaging.
        return;
    }
    mover.updateBalance(-rent);
    owner.updateBalance(rent);
    log("You paid $" + rent + " in rent to " + owner.name + ".");
}

function purchaseProperty(mover, placeIdx) {
    const place = places[placeIdx];

    mover.updateBalance(-place.p);
    place.own = mover.num;
    log("Congratulations, " + mover.name + "! You now own " + place.name + "!");

    $("#property-list" + mover.num).append("<br><div id='hud-property" + placeIdx + "'>" + place.name + "</div>");

    // Check for a new monopoly.
    const monopoly = MONOPOLIES.find(monopoly => monopoly.includes(placeIdx));
    if (monopoly !== undefined && monopoly.every(placeIdx => places[placeIdx].own === mover.num)) {
        const propertyNames = monopoly.map(placeIdx => places[placeIdx].name);
        log("Monopoly! You may now build houses on " + concatenatePropertyNames(propertyNames)
            + ", and their rents have doubled.");
        monopoly.forEach(placeIdx => {
            const [adder, remover, mortgager] = buildHouseButtons(mover, placeIdx);
            $("#hud-property" + placeIdx).append(adder);
            $("#hud-property" + placeIdx).append(remover);
            $("#hud-property" + placeIdx).append(mortgager);
        });
    }
}

function concatenatePropertyNames(names) {
    if (names.length === 3) {
        return names[0] + ", " + names[1] + ", and " + names[2];
    } else {
        return names[0] + " and " + names[1];
    }
}

function buildHouseButtons(owner, placeIdx) {
    const adder = document.createElement("div");
    adder.className = "button house-button house-adder";
    adder.title = "Buy a House";
    $(adder).append("<img class='house-icon' src='images/house.svg'><sup class='house-plus-sign'>+</sup>");
    adder.addEventListener("click", event => buyHouse(owner, placeIdx));

    const remover = document.createElement("div");
    remover.className = "button-negative button-disabled house-button house-remover";
    remover.title = "Sell a House";
    $(remover).append("<img class='house-icon' src='images/house.svg'><sup class='house-minus-sign'>-</sup>");
    remover.addEventListener("click", event => sellHouse(owner, placeIdx));

    const mortgager = document.createElement("div");
    mortgager.className = "button house-button property-mortgager";
    mortgager.title = "Mortgage the Property";
    $(mortgager).append("<img class='house-icon' src='images/mortgage.svg'><sup class='mortgage-symbol'>$</sup>");
    mortgager.addEventListener("click", event => mortgageOrUnmortgageProperty(owner, placeIdx));

    return [adder, remover, mortgager];
}

function buyHouse(owner, placeIdx) {
    const place = places[placeIdx];

    if (place.houseCount === 5 || place.isMortgaged) {
        return;
    }

    owner.updateBalance(-place.ho);
    place.houseCount ++;

    // Enable the - button.
    $("#hud-property" + placeIdx + " > .house-remover").toggleClass("button-disabled", false);

    // Disable the mortgage button.
    $("#hud-property" + placeIdx + " > .property-mortgager").toggleClass("button-disabled", true);

    if (place.houseCount === 5) {
        $("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", true);
        repeat(4, () => removeBuildingIcon(placeIdx));
        addBuildingIcon(placeIdx, "hotel");
        log("Upgraded to a hotel on " + place.name + ".");
    } else {
        addBuildingIcon(placeIdx, "house");
        log("Built a house on " + place.name + ".");
    }
}

function sellHouse(owner, placeIdx) {
    const place = places[placeIdx];

    if (place.houseCount === 0) {
        return;
    }

    // Selling a house only returns half the cost.
    owner.updateBalance(place.ho / 2);
    place.houseCount --;

    // Enable the + button.
    $("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", false);

    if (place.houseCount === 4) {
        repeat(4, () => addBuildingIcon(placeIdx, "house"));
        removeBuildingIcon(placeIdx);
        log("Downgraded from a hotel on " + place.name + ".");
        return;
    }

    if (place.houseCount === 0) {
        $("#hud-property" + placeIdx + " > .house-remover").toggleClass("button-disabled", true);
        $("#hud-property" + placeIdx + " > .property-mortgager").toggleClass("button-disabled", false);
    }

    log("Removed a house from " + place.name + ".");
    removeBuildingIcon(placeIdx);
}

function addBuildingIcon(placeIdx, buildingType) {
    const houseImage = document.createElement("img");
    houseImage.src = "images/" + buildingType + ".svg";
    houseImage.className = "placed-house";
    $("#board").children().eq(placeIdx).append(houseImage);
}

function removeBuildingIcon(placeIdx) {
    $("#board").children().eq(placeIdx).children("img:nth-of-type(1)").remove();
}

function repeat(n, func) {
    new Array(n).fill(null).map(_ => func());
}

function mortgageOrUnmortgageProperty(owner, placeIdx) {
    const place = places[placeIdx];
    if (place.isMortgaged) {
        unmortgageProperty(owner, placeIdx);
        return;
    }

    if (place.houseCount > 0) {
        return;
    }

    mortgageProperty(owner, placeIdx);
}

function mortgageProperty(owner, placeIdx) {
    const place = places[placeIdx];
    owner.updateBalance(place.p / 2);
    place.isMortgaged = true;

    const button = $("#hud-property" + placeIdx + " > .property-mortgager");
    button.children(".mortgage-symbol").text("!");
    button.toggleClass("button button-negative");
    button.attr("title", "Unmortgage the Property");

    $("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", true);

    log(`Mortgaged ${place.name} for $${place.p / 2}.`);
}

function unmortgageProperty(owner, placeIdx) {
    const place = places[placeIdx];
    owner.updateBalance(- place.p / 2);
    place.isMortgaged = false;

    const button = $("#hud-property" + placeIdx + " > .property-mortgager");
    button.children(".mortgage-symbol").text("$");
    button.toggleClass("button button-negative");
    button.attr("title", "Mortgage the Property");

    $("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", false);
    log(`Unmortgaged ${place.name} for $${place.p / 2}.`);
}

function respondPayOutOfJail(hasAgreed) {
    // Hide the Pay/No buttons.
    $("#button-box").children().remove();

    if (! hasAgreed) {
        concludeTurn();
        return;
    }

    const mover = GlobalState.currentPlayer;
    mover.getOutOfJail();
    mover.updateBalance(-50);
    concludeTurn();
}

function addGetOutOfJailFreeCard(mover) {
    mover.numJailCards ++;

    if (mover.numJailCards === 1) {
        const isUsageEnabled = mover.jailDays > 0 ? "" : "button-disabled";
        $("#jail-card" + mover.num).append(`<br />Get Out of Jail Free<span id='jail-card-quantity${mover.num}'></span><span class='button ${isUsageEnabled} use-jail-card' onclick='useGetOutOfJailFreeCard(players[${mover.num}])'>Use Card</div>`);
    } else {
        $("#jail-card-quantity" + mover.num).text(" x" + mover.numJailCards);
    }
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

// function transaction() {
//     var amount=prompt("Enter the volume of the transaction below.");
//     var recip=prompt("Enter the recipient.");
//     var giver=prompt("Enter the sender.");
    
//     switch(recip){
//         case players[0].name:players[0].balance+=parseInt(amount,10);break;
//         case players[1].name:players[1].balance+=parseInt(amount,10);break;
//         case players[2].name:players[2].balance+=parseInt(amount,10);break;
//         default:mess.textContent+="Transaction error! Invalid recipient!";giver="anything invalid";
//     }
    
//     switch(giver){
//         case players[0].name:players[0].balance-=amount;break;
//         case players[1].name:players[1].balance-=amount;break;
//         case players[2].name:players[2].balance-=amount;break;
//         case "anything invalid":break;
//         default:mess.textContent+="Transaction error! Invalid sender!";
//     }
//     $("#bal0").text("$"+players[0].balance);
//     $("#bal1").text("$"+players[1].balance);
//     $("#bal2").text("$"+players[2].balance);
// }
