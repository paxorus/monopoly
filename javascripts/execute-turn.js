const mess = document.getElementById("messageBox");// Message box.

function rollDice() {
    return Math.ceil(6 * Math.random());
}

function concludeTurn() {
    // Show "Next Turn" button.
    $("#messageBox").append($("#executeTurn"));
}

function executeTurn() {
    // Advance to next player.
    GlobalState.currentPlayer = players[(GlobalState.currentPlayer.num + 1) % players.length];
    const mover = GlobalState.currentPlayer;

    $("#initial-interactive").css("display", "none");
    $("#interactive").css("display", "block");
    $("#turn").text(mover.name);
    $("#exmess").append($("#executeTurn"));
    mess.textContent = "";

    if (mover.jailDays > 0) {
        const roll1 = rollDice();
        const roll2 = rollDice();
        mess.textContent += "You rolled " + roll1 + " and " + roll2 + ".\n";
        if (roll1 === roll2) {
            mess.textContent += "A double! You're free!\n";
            mover.getOutofJail();
        } else {
            // No need to roll if 1 day left, turn's up anyways.
            mover.jailDays --;
            if (mover.jailDays === 0) {
                mover.getOutofJail();
            } else {
                const turns = (mover.jailDays > 1) ? "turns" : "turn";
                mess.textContent += "No double... " + mover.name + ", you have " + mover.jailDays + " " + turns + " remaining on your sentence.\n";
            }
        }
        concludeTurn();
    } else {
        mover.rollCount = 0;// Limited to 3 by jail.
        rollMove(mover);
    }
}

function shouldRollAgain(mover) {
    const [roll1, roll2] = mover.latestRoll;

    if (roll1 != roll2) {
        concludeTurn();
        return false;
    } else if (mover.rollCount == 3) {
        mess.textContent += "A 3rd double! Troll alert! You're going to jail.\n";
        mover.goToJail();
        concludeTurn();
        return false;
    } else if (mover.jailDays > 0) {
        concludeTurn();
        return false;
    }

    mess.innerText += "A double!\n";
    return true;
}

function rollMove(mover) {
    const roll1 = 1// rollDice();
    const roll2 = 2 //rollDice();
    mover.latestRoll = [roll1, roll2];
    mover.rollCount ++;
    mess.textContent += "You rolled a " + roll1 + " and a " + roll2 + ".\n";

    let newLocation = mover.locnum + roll1 + roll2;
    if (newLocation > 39) {
        // Pass Go.
        newLocation -= 40;
        mover.updateBalance(200);
    }
    mover.updateLocation(newLocation);

    mess.textContent += "You landed on " + places[newLocation].name + ".\n";
    action(mover);
}

function react(ifBuy) {
    // Hide the Buy/No buttons.
    mess.removeChild(mess.getElementsByClassName("button")[0]);
    mess.removeChild(mess.getElementsByClassName("button-negative")[0]);    

    const mover = GlobalState.currentPlayer;

    if (ifBuy) {
        purchaseProperty(mover, mover.locnum);
    } else {
        mess.textContent += places[mover.locnum].name + " went unsold.\n";
    }
    if (shouldRollAgain(mover)) {
        rollMove(mover);
    }
}

function payRent(mover, owner, rent) {
    mover.updateBalance(-rent);
    owner.updateBalance(rent);
    mess.textContent += "You paid $" + rent + " in rent to " + owner.name + ".\n";
}

function purchaseProperty(mover, placeIdx) {
    const place = places[placeIdx];

    mover.updateBalance(-place.p);
    place.own = mover.num;
    mess.textContent += "Congratulations, " + mover.name + "! You now own " + place.name + "!\n";

    $("#property-list" + mover.num).append("<br><div id='hud-property" + placeIdx + "'>" + place.name + "</div>");

    // Check for a new monopoly.
    const monopoly = MONOPOLIES.find(monopoly => monopoly.includes(placeIdx));
    if (monopoly !== undefined && monopoly.every(placeIdx => places[placeIdx].own === mover.num)) {
        const propertyNames = monopoly.map(placeIdx => places[placeIdx].name);
        mess.textContent += "Monopoly! You may now build houses on " + concatenatePropertyNames(propertyNames)
            + ", and their rents have doubled.";
        monopoly.forEach(placeIdx => {
            const [adder, remover] = buildHouseButtons();
            $("#hud-property" + placeIdx).append(adder);
            $("#hud-property" + placeIdx).append(remover);
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

function buildHouseButtons() {
    const adder = document.createElement("div");
    adder.className = "button house-button";
    $(adder).append("<img class='house-icon' src='images/house.svg'><sup class='house-adder'>+</sup>");

    const remover = document.createElement("div");
    remover.className = "button-negative button-disabled house-button";
    $(remover).append("<img class='house-icon' src='images/house.svg'><sup class='house-remover'>-</sup>");

    return [adder, remover];
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
