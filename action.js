const mess = document.getElementById("mess");// Message box.
const ram = document.getElementById("ram");// "Next Turn" roll-and-move button.
const exmess = document.getElementById("exmess");// Where to hide buttons.


function showCard(placeIdxString) {

    const placeIdx = parseInt(placeIdxString, 10);
    const place = places[placeIdx];

    // Update name.
    $("#propname").text(place.name);

    // Update text color.
    $("#propname").css("color", BLACK_TEXT_COLORS.has(placeIdx) ? "black" : "white");

    $("#propname").css("backgroundColor", place.cardColor || place.col);
    $("#propname").css("display", "block");

    // Hide price and rents for non-properties.
    $("#card").css("display", (place.p === 0) ? "none" : "block");

    // Populate price and rents.    
    switch (placeIdx) {
        case 5: case 15: case 25: case 35:
            // Display railroad rents.
            $("#price").text("$" + place.p);
            $("#rent0").html("Rent: $" + place.re0);
            $("#rent1").html("2 railroads: $" + place.re1);
            $("#rent2").html("3 railroads: $" + place.re2);
            $("#rent3").html("4 railroads: $" + place.re3);
            $("#rent4").text("");
            $("#rent5").html("");
            break;
        case 12: case 28:
            // Display utility rents.
            $("#price").text("$" + place.p);
            $("#rent0").text("One Utility: 4 times roll");
            $("#rent1").text("Both Utilities: 10 times roll");
            $("#rent2").text("");
            $("#rent3").text("");
            $("#rent4").text("");
            $("#rent5").text("");
            break;
        default:
            // Display house rents.
            $("#price").text("$" + place.p);
            $("#rent0").text("Rent: $" + place.re0);
            $("#rent1").text("With 1 House: $" + place.re1);
            $("#rent2").text("With 2 Houses: $" + place.re2);
            $("#rent3").text("With 3 Houses: $" + place.re3);
            $("#rent4").text("With 4 Houses: $" + place.re4);
            $("#rent5").text("With HOTEL: $" + place.re5);
            break;
    }
}

function updateBalance(player) {
    // Update the view with the player's balance.
    $("#bal" + player.num).text("$" + player.bal);
}

function updateLocation(mover) {
    // Update the view with the current user's location.
    $("#loc" + mover.num).text(places[mover.locnum].name);
    //$("#board div:eq("+(mover.locnum+1)+")").append($("#marker"+mover.num));
    if (places[mover.locnum].ho) {
        $("#board").children().eq(mover.locnum).children().first().append($("#marker" + mover.num));
    } else{
        $("#board").children().eq(mover.locnum).append($("#marker" + mover.num));
    }
}

function rollDice() {
    return Math.ceil(6 * Math.random());
}

function handle() {
    // Advance to next player.
    GlobalState.currentPlayer = players[(GlobalState.currentPlayer.num + 1) % players.length];
    const mover = GlobalState.currentPlayer;
    
    $("#turn").text(mover.name);
    $("#exmess").append($("#ram"));
    mess.textContent = "";

    if (mover.injail > 0) {
        const roll1 = rollDice();
        const roll2 = rollDice();
        mess.textContent += "You rolled a " + roll1 + " and a " + roll2 + ".\n";
        if (roll1 === roll2) {
            mess.textContent += "A double! You're free!\n";
            getOutofJail();
        } else {
            // No need to roll if 1 day left, turn's up anyways.
            mover.injail --;
            if (mover.injail === 0) {
                getOutofJail();
            } else {
                mess.textContent += "No double..." + mover.name + ", you have " + mover.injail + " turn(s) remaining on your sentence.\n";
            }
        }
        $("#mess").append($("#ram"));// Turn is done.
    } else {
        GlobalState.rollNumber = 0;// Limited to 3 by jail.
        rollMove(mover);
    }
}

function shouldRollAgain(mover) {
    const [roll1, roll2] = GlobalState.currentRoll;
    const rollNumber = GlobalState.rollNumber;

    if (roll1 != roll2) {
        $("#mess").append($("#ram"));
        return false;
    } else if (rollNumber == 3) {
        mess.textContent += "A 3rd double! Troll alert! You're going to jail.\n";
        goToJail();
        $("#mess").append($("#ram"));
        return false;
    } else if (mover.injail > 0) {
        $("#mess").append($("#ram"));
        return false;
    }
    return true;
}

function rollMove(mover) {
    const roll1 = rollDice();
    const roll2 = rollDice();
    mess.textContent += "You rolled a " + roll1 + " and a " + roll2 + ".\n";

    mover.locnum += roll1 + roll2;
    if (mover.locnum > 39) {
        // Pass Go.
        mover.locnum -= 40;
        mover.bal += 200;
    }

    mess.textContent += "You landed on " + places[mover.locnum].name + ".\n";
    updateLocation(mover);
    GlobalState.currentRoll = [roll1, roll2];
    GlobalState.rollNumber ++;
    action(mover, roll1, roll2);
}

function react(ifBuy) {
    // Hide the Buy/No buttons.
    mess.removeChild(mess.getElementsByClassName("button")[0]);
    mess.removeChild(mess.getElementsByClassName("button")[0]);    

    const mover = GlobalState.currentPlayer;

    if (ifBuy) {
        mover.bal -= places[mover.locnum].p;
        updateBalance(mover);
        $("#ploc"+mover.num).append("<br>"+places[mover.locnum].name);
        places[mover.locnum].own=mover.num;
        mess.textContent += "Congratulations, " + mover.name + "! You now own " + places[mover.locnum].name + "!\n";
    } else {
        mess.textContent += places[mover.locnum].name + " went unsold.\n"
    }
    if (shouldRollAgain(mover)) {
        mess.innerText += "A double!\n";
        rollMove(mover);
    }
}

function pay(mover, owner, rent){
    mover.bal-=rent;
    updateBalance(mover);
    owner.bal += rent;
    updateBalance(owner);
    mess.textContent += "You paid $" + rent + " in rent to " + owner.name + ".\n";
}

function action(mover, roll1, roll2) {
    let waitForReact = false;
    const place = places[mover.locnum];
    if (place.p !== 0) {// Landed on a property.
        if (place.own === -1) {
            // Unowned: offer the property to the user.
            mess.textContent += mover.name + ", would you like to buy " + place.name + " for $" + place.p + "?\n";
            mess.innerHTML += "<div class='button' onclick='react(true)'>Buy " + place.name + "</div><div class='button' onclick='react(false)'>No</div>";
            waitForReact = true;
        } else if (place.own != mover.num) {
            // Owned: pay rent to the owner.
            const owner = players[place.own];
            let rent;
            switch (mover.locnum) {
                case 12: case 28:// Utilities
                    rent = 4 * (roll1 + roll2);
                    break;
                //case 5:case 15:case 25:case 35:rent=;break;
                default:
                    rent = place.re0;
            }
            pay(mover, owner, rent);
        }
    } else {// Landed on a non-property.
        switch(mover.locnum){
            case 7:case 22:case 36:
                chance(mover);
                break;
            case 2:case 17:case 33:
                comChest(mover);
                break;
            case 4:// Income tax
                mover.bal -= 200;
                GlobalState.tax += 200;
                updateBalance(mover);
                mess.textContent += "You paid $200 income tax.\n";
                $("#alltax").text("$ " + GlobalState.tax);
                break;
            case 38:// Luxury tax
                mover.bal -= 100;
                GlobalState.tax += 100;
                updateBalance(mover);
                mess.textContent += "You paid $100 luxury tax.\n";
                $("#alltax").html("$ " + GlobalState.tax);
                break;
            case 20:// Free parking
                const tax = GlobalState.tax;
                mover.bal += tax;
                GlobalState.tax = 0;
                $("#alltax").text("$0");
                updateBalance(mover);
                mess.textContent += "You collected $" + tax + " from free parking!\n";
                break;
            case 30:// Go to jail
                goToJail();
                break;
        }
    }
    
    if (!waitForReact && shouldRollAgain(mover)) {
        mess.innerText += "A double!\n";
        rollMove(mover);
    }
}

function chance(mover) {
    var newl=true;//new-line 
    mess.textContent+="Chance: ";
    switch(Math.floor(Math.random()*16)) {
    case 0:mess.textContent+="Advance to Boardwalk.";mover.locnum=39;updateLocation(mover);action();break;
    case 1:mess.textContent+='Advance to "Go". (Collect $200)';mover.locnum=0;mover.bal+=200;break;
    case 2:mess.textContent+="Make general repairs on all your property: For each house pay $25, for each hotel pay $100.";break;
    case 3:mess.textContent+="Speeding fine $15.";mover.locnum-=15;updateLocation(mover);action();break;
    case 4:mess.textContent+='Advance to St. Charles Place. If you pass "Go" collect $200.';if (mover.locnum>11) {mover.bal+=200;updateBalance(mover)}mover.locnum=11;action();break;
    case 5:mess.textContent+="Your building loan matures. Collect $150.";mover.bal+=150;break;
    case 6:mess.textContent+="Go back three spaces.";mover.locnum-=3;action();break;
    case 7:mess.textContent+="GET OUT OF JAIL FREE. This card may be kept until needed or traded.";break;
    case 8:mess.textContent+="Bank pays you dividend of $50.";mover.bal+=50;break;
    case 9:mess.textContent+='Advance to Illinois Avenue. If you pass "Go" collect $200.';if (mover.locnum>24) {mover.bal+=200}mover.locnum=24;action();break;
    case 10:mess.textContent+="You have been elected chairman of the board. Pay each player $50.";for(var c=0;c<players.length;c++){players[c].bal+=50}mover.bal-=50*players.length;break;
    case 11:mess.textContent+='Go to jail. Go directly to jail, do not pass "Go", do not collect $200.';goToJail();break;
    case 12:mess.textContent+="Advance to the nearest utility. If Unowned, you may buy it from the bank. If Owned, pay owner a total ten times amount thrown on dice.";
            if(mover.locnum>12 && mover.locnum<28){mover.locnum=28}else{mover.locnum=12}
            if(places[mover.locnum].own==-1){action()}
            else if(places[mover.locnum].own!=mover.num){
                pay(players[places[mover.locnum].own],10*(roll1+roll2));
            }
            newl=false;
    break;
    case 13:mess.textContent+='Take a trip to Reading Railroad. If you pass "Go" collect $200.';if (mover.locnum>5) {mover.bal+=200}mover.locnum=5;break;
    case 14: case 15: mess.textContent+="Advance to the nearest railroad. If Unowned, you may buy it from the bank. If Owned, pay owner twice the rental to which they are otherwise entitled.";
            mover.locnum=5*Math.floor(mover.locnum/5);
            if(places[mover.locnum].own==-1){action()}
            else if(places[mover.locnum].own!=mover.num){
                var place=places[mover.locnum];
                pay(players[place.own],2*place.re0);
            }
            newl=false;
    break;

    }
    mess.innerHTML+="\n";
    updateBalance(mover);if(mover.injail===0){updateLocation(mover)}
}

function comChest(mover) {
    mess.textContent+="Community Chest: ";
    switch(Math.floor(Math.random()*16)) {
    case 0: mess.textContent+="GET OUT OF JAIL FREE. This card may be kept until needed or traded.";break; 
    case 1: mess.textContent+="You have won second prize in a beauty contest. Collect $10.";mover.bal+=10;break;
    case 2: mess.textContent+="Holiday fund matures. Receive $100.";mover.bal+=100;break;
    case 3: mess.textContent+="Bank error in your favor. Collect $200.";mover.bal+=200;break;
    case 4: mess.textContent+='Go to jail. Go directly to jail, do not pass "Go", do not collect $200.';goToJail();break;
    case 5: mess.textContent+="It is your birthday. Collect $10 from every player.";mover.bal+=10*players.length;for(var c=0;c<players.length;c++){players[c].bal-=10;$("bal"+c).text("$"+players[c].bal)}break;
    case 6: mess.textContent+="Doctor's fees. Pay $50.";mover.bal-=50;break;
    case 7: mess.textContent+="Pay hospital fees of $100.";mover.bal-=100;break;
    case 8: mess.textContent+="You inherit $100.";mover.bal+=100;break;
    case 9: mess.textContent+="From sale of stock you get $50.";mover.bal+=50;break; 
    case 10: mess.textContent+="You are assessed for street repairs: $40 per house, $115 per hotel.";break; 
    case 11: mess.textContent+='Advance to "Go". (Collect $200)';mover.locnum=0;mover.bal+=200;break;
    case 12: mess.textContent+="Income tax refund. Collect $20.";mover.bal+=20;break; 
    case 13: mess.textContent+="Pay school fees of $50.";mover.bal-=50;break;
    case 14: mess.textContent+="Life insurance matures. Collect $100.";mover.bal+=100;break; 
    case 15: mess.textContent+="Receive $25. Consultancy fee.";mover.bal+=25;break;
    }
    mess.textContent+="\n";
    updateBalance(mover);if(mover.injail===0){updateLocation(mover)}
}

function goToJail() {
    mess.textContent+="You will be in jail for 3 turns!";
    mover.locnum=10;
    mover.injail=3;
    $("#loc"+mover.num).text("Jail");
    $("#board div:nth-child(10)").append($("#marker"+mover.num));
}

function getOutofJail() {
    mess.textContent+="You are now out of jail!";
    mover.injail=0;
    $("#loc"+mover.name).text("Just Visiting");    
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
