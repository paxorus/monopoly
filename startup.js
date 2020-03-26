// Players are hard-coded for now.
const Sprite = {
    BLAZIKEN: 257,
    SCEPTILE: 254,
    SWAMPERT: 260,
    VENUSAUR: 3,
    CHARIZARD: 6
}

class Player {
    constructor(name, num, color, spriteId) {
        this.name = name;
        this.num = num;
        this.color = color;// needed?
        this.spriteId = spriteId;

        this.bal = 1500;// balance
        this.locnum = 0;// placeIdx
        this.injail = 0;// jailTime
        this.latestRoll = null;
        this.rollCount = 0;
    }

    goToJail() {
        mess.textContent += "You will be in jail for 3 turns!";
        this.locnum = 10;
        this.injail = 3;
        $("#loc" + this.num).text("Jail");
        $("#board div:nth-child(10)").append($("#marker" + this.num));
    }

    getOutofJail() {
        this.textContent += "You are now out of jail!";
        this.injail = 0;
        $("#loc" + this.name).text("Just Visiting");
    }

    updateBalance(income) {
        // Update the view with the player's balance.
        this.bal += income;
        $("#bal" + this.num).text("$" + this.bal);
    }

    updateLocation(newLocation) {
        this.locnum = newLocation;
        // Update the view with the current user's location.
        $("#loc" + this.num).text(places[this.locnum].name);
        //$("#board div:eq("+(mover.locnum+1)+")").append($("#marker"+mover.num));
        if (places[this.locnum].ho) {
            $("#board").children().eq(this.locnum).children().first().append($("#marker" + this.num));
        } else{
            $("#board").children().eq(this.locnum).append($("#marker" + this.num));
        }
    }
}

const players = [
    new Player("Prakhar", 0, "#E80", Sprite.BLAZIKEN),
    new Player("Kanav", 1, "#0C0", Sprite.SCEPTILE),
    new Player("Jerry", 2, "#08F", Sprite.SWAMPERT),
    new Player("Ashwin", 3, "#FFF", Sprite.VENUSAUR),
    new Player("Michael", 4, "#000", Sprite.CHARIZARD)
];

// Prefer images to text for special locations.
/*var locText=[" ","","CC","","Tax"," ","","?","","",
            "Just Visiting","","","",""," ","","CC","","",
            "$ 0","","?","",""," ","","","","",
            "To Jail","","","CC",""," ","?",""," "];*/

function buildGameBoard() {
    // Build and place all board locations on DOM.

    const board = document.getElementById("board");

    for (let i = 0; i <= 39; i ++){
        const newdiv = document.createElement("div");
        newdiv.dataset.no = i;
        const indiv = document.createElement("div");
        newdiv.style.backgroundColor = places[i].col;
        if (places[i].ho) { // Color walkway neutral for house-able properties.
            indiv.style.backgroundColor = "rgb(213,232,212)";
        }
        
        switch (Math.floor(i / 10)) {
            case 0:
                newdiv.className = "location bottom";
                newdiv.style.right = 70 * i + "px";
                indiv.style.bottom = 0;
                indiv.className = "horizontal";
                break;
            case 1:
                newdiv.className = "location left";
                newdiv.style.top = 680 - 68 * (i - 10) + "px";
                indiv.style.left = 0;
                indiv.className = "vertical";
                break;
            case 2:
                newdiv.className = "location top";
                newdiv.style.right = 700 - 70 * (i - 20) + "px";
                indiv.style.top = 0;
                indiv.className = "horizontal";
                break;
            case 3:
                newdiv.className = "location right";
                newdiv.style.top = 68 * (i - 30) + "px";
                indiv.style.right = 0;
                indiv.className = "vertical";
                break;
        }
        newdiv.appendChild(indiv);
        board.appendChild(newdiv);
    }

    // Free Parking: add #alltax
    board.childNodes[20].firstChild.id = "alltax";

    // Go: set image
    board.childNodes[0].style.background = "url('go.svg') no-repeat";

    // Railroads: set images
    for(let i = 5; i <= 35; i += 10) {
        const railroad = board.childNodes[i];
        railroad.style.background = "url('rr.svg') no-repeat";
        railroad.style.backgroundSize = "68px 66px";
    }

    $(".location").click(function() {
        showCard(this.dataset.no);
    });
}

function buildPlayerViews() {
    // Build each player view.

    const board = document.getElementById("board");

    players.forEach((player, i) => {
        const circ = document.createElement("img");    
        circ.id = "marker" + i;
        circ.className = "circ";
        circ.src = "http://veekun.com/dex/media/pokemon/dream-world/" + player.spriteId + ".svg";
        board.childNodes[0].appendChild(circ);

        const heads = document.getElementById("heads");
        heads.innerHTML+="<div id='head" + i + "' class='head'></div><div style='background-color:" + player.color + ";height:5px'></div>";
        heads.innerHTML+="<div class='dashboard' id='user" + i + "' style='display:none'><span id='ploc" + i + "'></span></div>";
    });
}

function buildPlayerDisplays() {
    // Set up the HUD for each player: name, location, and balance.
    players.forEach((player, i) => {
        $("#head" + i).html(player.name+": <span id='loc" + i + "'>Go</span><div style='float:right' id='bal" + i + "'>$1500</div>");    

        // Expand HUD on click.
        $("#head" + i).click(function() {
            if (document.getElementById("user" + i).style.display == "none") {
                slide(i);
            }
        });
    });
}

function slide(user) {
    // Collapse HUDs for all but current user.
    players.forEach((player, i) => {
        if (i != user) {
            $("#user" + i).slideUp();
        } else {
            $("#user" + i).slideDown();
        }
    });
}

const randomPlayer = players[Math.floor(Math.random() * players.length)];

const GlobalState = {
    currentPlayer: randomPlayer,
    tax: 0
}

buildGameBoard();
buildPlayerViews();
buildPlayerDisplays();

const nextPlayer = players[(GlobalState.currentPlayer.num + 1) % players.length];
$("#turn").text(nextPlayer.name);
