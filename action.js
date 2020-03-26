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
    
    $("#turn").text(mover.name);
    $("#exmess").append($("#executeTurn"));
    mess.textContent = "";

    if (mover.injail > 0) {
        const roll1 = rollDice();
        const roll2 = rollDice();
        mess.textContent += "You rolled a " + roll1 + " and a " + roll2 + ".\n";
        if (roll1 === roll2) {
            mess.textContent += "A double! You're free!\n";
            mover.getOutofJail();
        } else {
            // No need to roll if 1 day left, turn's up anyways.
            mover.injail --;
            if (mover.injail === 0) {
                mover.getOutofJail();
            } else {
                mess.textContent += "No double..." + mover.name + ", you have " + mover.injail + " turn(s) remaining on your sentence.\n";
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
    } else if (mover.rollNumber == 3) {
        mess.textContent += "A 3rd double! Troll alert! You're going to jail.\n";
        mover.goToJail();
        concludeTurn();
        return false;
    } else if (mover.injail > 0) {
        concludeTurn();
        return false;
    }
    return true;
}

function rollMove(mover) {
    const roll1 = rollDice();
    const roll2 = rollDice();
    mess.textContent += "You rolled a " + roll1 + " and a " + roll2 + ".\n";

    mover.updateLocation(mover.locnum + roll1 + roll2);
    if (mover.locnum > 39) {
        // Pass Go.
        mover.updateLocation(mover.locnum - 40);
        mover.updateBalance(200);
    }

    mess.textContent += "You landed on " + places[mover.locnum].name + ".\n";
    mover.latestRoll = [roll1, roll2];
    mover.rollCount ++;
    action(mover);
}

function react(ifBuy) {
    // Hide the Buy/No buttons.
    mess.removeChild(mess.getElementsByClassName("button")[0]);
    mess.removeChild(mess.getElementsByClassName("button")[0]);    

    const mover = GlobalState.currentPlayer;

    if (ifBuy) {
        mover.updateBalance(-places[mover.locnum].p);
        $("#ploc" + mover.num).append("<br>" + places[mover.locnum].name);
        places[mover.locnum].own = mover.num;
        mess.textContent += "Congratulations, " + mover.name + "! You now own " + places[mover.locnum].name + "!\n";
    } else {
        mess.textContent += places[mover.locnum].name + " went unsold.\n"
    }
    if (shouldRollAgain(mover)) {
        mess.innerText += "A double!\n";
        rollMove(mover);
    }
}

function pay(mover, owner, rent) {
    mover.updateBalance(-rent);
    owner.updateBalance(rent);
    mess.textContent += "You paid $" + rent + " in rent to " + owner.name + ".\n";
}

function transaction() {
    var amount=prompt("Enter the volume of the transaction below.");
    var recip=prompt("Enter the recipient.");
    var giver=prompt("Enter the sender.");
    
    switch(recip){
        case players[0].name:players[0].bal+=parseInt(amount,10);break;
        case players[1].name:players[1].bal+=parseInt(amount,10);break;
        case players[2].name:players[2].bal+=parseInt(amount,10);break;
        default:mess.textContent+="Transaction error! Invalid recipient!";giver="anything invalid";
    }
    
    switch(giver){
        case players[0].name:players[0].bal-=amount;break;
        case players[1].name:players[1].bal-=amount;break;
        case players[2].name:players[2].bal-=amount;break;
        case "anything invalid":break;
        default:mess.textContent+="Transaction error! Invalid sender!";
    }
    $("#bal0").text("$"+players[0].bal);
    $("#bal1").text("$"+players[1].bal);
    $("#bal2").text("$"+players[2].bal);
}
