function action(mover) {
    // On location change (from a roll, chance card, or comm chest card), follow the rules of that square.
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
                mover.goToJail();
                break;
        }
    }
    
    if (!waitForReact && shouldRollAgain(mover)) {
        mess.innerText += "A double!\n";
        rollMove(mover);
    }
}

function chance(mover) {
    mess.textContent += "Chance: ";
    switch(Math.floor(Math.random() * 16)) {
        case 0:
            mess.textContent += "Advance to Boardwalk.";
            mover.updateLocation(39);
            action(mover);
            break;
        case 1:
            mess.textContent += 'Advance to "Go". (Collect $200)';
            mover.updateLocation(0);
            mover.updateBalance(200);
            break;
        case 2:
            mess.textContent += "Make general repairs on all your property: For each house pay $25, for each hotel pay $100.";
            throw Error("Not implemented.");
            break;
        case 3:
            mess.textContent += "Speeding fine $15.";
            mover.updateBalance(-15);
            break;
        case 4:
            mess.textContent += 'Advance to St. Charles Place. If you pass "Go" collect $200.';
            if (mover.locnum > 11) {
                mover.updateBalance(200);
            }
            mover.updateLocation(11);
            action(mover);
            break;
        case 5:
            mess.textContent += "Your building loan matures. Collect $150.";
            mover.updateBalance(150);
            break;
        case 6:
            mess.textContent += "Go back three spaces.";
            mover.updateLocation(mover.locnum - 3);
            action(mover);
            break;
        case 7:
            mess.textContent += "GET OUT OF JAIL FREE. This card may be kept until needed or traded.";
            throw Error("Not implemented");
            break;
        case 8:
            mess.textContent += "Bank pays you dividend of $50.";
            mover.updateBalance(50);
            break;
        case 9:
            mess.textContent += 'Advance to Illinois Avenue. If you pass "Go" collect $200.';
            if (mover.locnum > 24) {
                mover.updateBalance(200);
            }
            mover.updateLocation(24);
            action(mover);
            break;
        case 10:
            mess.textContent += "You have been elected chairman of the board. Pay each player $50.";
            players.forEach(player => {
                player.updateBalance(50);
            });
            mover.updateBalance(-50 * players.length);
            break;
        case 11:
            mess.textContent += 'Go to jail. Go directly to jail, do not pass "Go", do not collect $200.';
            mover.goToJail();
            break;
        case 12:
            mess.textContent += "Advance to the nearest utility. If Unowned, you may buy it from the bank. If Owned, pay owner a total ten times amount thrown on dice.";
            if (mover.locnum > 12 && mover.locnum < 28) {
                mover.updateLocation(28);
            } else {
                mover.updateLocation(12);
            }
            if (places[mover.locnum].own==-1) {
                action(mover);
            } else if (places[mover.locnum].own != mover.num) {
                const owner = players[places[mover.locnum].own];
                pay(mover, owner, 10 * (roll1 + roll2));
            }
            break;
        case 13:
            mess.textContent += 'Take a trip to Reading Railroad. If you pass "Go" collect $200.';
            if (mover.locnum > 5) {
                mover.updateBalance(200);
            }
            mover.setLocation(5);
            break;
        case 14: case 15:
            mess.textContent += "Advance to the nearest railroad. If Unowned, you may buy it from the bank. If Owned, pay owner twice the rental to which they are otherwise entitled.";
            const nearestRailroadIdx = Math.floor(mover.locnum / 5);// Round to nearest railroad.
            mover.updateLocation(nearestRailroadIdx);
            const railroad = places[nearestRailroadIdx];
            if (railroad.own === -1) {
                action(mover);
            } else if (players[railroad.own] != mover) {
                // Control the rent properly.
                pay(players[place.own], 2 * railroad.re0);
            }
            break;
    }

    mess.innerHTML += "\n";
}

function comChest(mover) {
    mess.textContent+="Community Chest: ";
    switch(Math.floor(Math.random()*16)) {
    case 0: mess.textContent+="GET OUT OF JAIL FREE. This card may be kept until needed or traded.";break; 
    case 1: mess.textContent+="You have won second prize in a beauty contest. Collect $10.";mover.bal+=10;break;
    case 2: mess.textContent+="Holiday fund matures. Receive $100.";mover.bal+=100;break;
    case 3: mess.textContent+="Bank error in your favor. Collect $200.";mover.bal+=200;break;
    case 4: mess.textContent+='Go to jail. Go directly to jail, do not pass "Go", do not collect $200.';mover.goToJail();break;
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