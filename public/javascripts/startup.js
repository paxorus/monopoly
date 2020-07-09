import Player from "./player.js";
import {places} from "./location-configs.js";
import {showCard} from "./display-card.js";

// Players are hard-coded for now.
const Sprite = {
    SWAMPERT_MEGA: "/9/98/260Swampert-Mega.png",
    BLAZIKEN_MEGA: "/f/fa/257Blaziken-Mega.png",
    SCEPTILE_MEGA: "/6/67/254Sceptile-Mega.png",
    CHARIZARD_MEGA_Y: "/f/fd/006Charizard-Mega_Y.png",
    SALAMENCE_MEGA: "/f/f3/373Salamence-Mega.png",

    KYOGRE_PRIMAL: "/f/f1/382Kyogre-Primal.png",
    GROUDON_PRIMAL: "/9/9d/383Groudon-Primal.png",
    RAYQUAZA_MEGA: "/5/58/384Rayquaza-Mega.png",
    DIALGA: "/8/8a/483Dialga.png",
    ZEKROM: "/8/81/644Zekrom.png",
}

const LEGENDARY_MODE = false;

const players = [
    new Player("Prakhar", 0, LEGENDARY_MODE ? Sprite.KYOGRE_PRIMAL : Sprite.SWAMPERT_MEGA),
    new Player("Jerry", 1, LEGENDARY_MODE ? Sprite.GROUDON_PRIMAL : Sprite.BLAZIKEN_MEGA),
    new Player("Kanav", 2, LEGENDARY_MODE ? Sprite.RAYQUAZA_MEGA : Sprite.SCEPTILE_MEGA),
    new Player("Ashwin", 3, LEGENDARY_MODE ? Sprite.DIALGA : Sprite.CHARIZARD_MEGA_Y),
    new Player("Michael", 4, LEGENDARY_MODE ? Sprite.ZEKROM : Sprite.SALAMENCE_MEGA)
];

const JAIL_VERTICAL_WALKWAY_CAPACITY = 3;

function buildGameBoard() {
    // Build and place all board locations on DOM.

    const board = document.getElementById("board");

    for (let i = 0; i <= 39; i ++) {
        const newdiv = document.createElement("div");
        newdiv.dataset.no = i;
        const indiv = document.createElement("div");
        newdiv.style.backgroundColor = places[i].col;
        
        switch (Math.floor(i / 10)) {
            case 0:
                newdiv.className = "location bottom";
                newdiv.style.left = 70 * (10 - i) + "px";
                indiv.style.bottom = 0;
                indiv.className = "walkway horizontal";
                break;
            case 1:
                newdiv.className = "location left";
                newdiv.style.top = 680 - 68 * (i - 10) + "px";
                indiv.style.left = 0;
                indiv.className = "walkway vertical";
                break;
            case 2:
                newdiv.className = "location top";
                newdiv.style.left = 70 * (i - 20) + "px";
                indiv.style.top = 0;
                indiv.className = "walkway horizontal";
                break;
            case 3:
                newdiv.className = "location right";
                newdiv.style.top = 68 * (i - 30) + "px";
                indiv.style.right = 0;
                indiv.className = "walkway vertical";
                break;
        }

        // Add a neutral-colored walkway for house-able properties.
        if (places[i].ho) {
            newdiv.appendChild(indiv);
        }
        board.appendChild(newdiv);
    }

    // Free Parking: add #alltax
    board.childNodes[20].id = "alltax";

    // Go: set image
    board.childNodes[0].style.background = "url('images/go.svg') no-repeat";
    board.childNodes[0].style.backgroundColor = "";
    board.childNodes[0].style.backgroundSize = "68px 66px";

    // Railroads: set images
    for(let i = 5; i <= 35; i += 10) {
        const railroad = board.childNodes[i];
        railroad.style.background = "url('images/railroad.svg') no-repeat";
        railroad.style.backgroundSize = "68px 66px";
        railroad.style.backgroundColor = "";
    }

    board.childNodes[12].style.background = "url('images/electric-company.svg') no-repeat";
    board.childNodes[12].style.backgroundColor = "";
    board.childNodes[12].style.backgroundSize = "68px 66px";

    board.childNodes[28].style.background = "url('images/water-works.svg') no-repeat";
    board.childNodes[28].style.backgroundColor = "";
    board.childNodes[28].style.backgroundSize = "68px 66px";

    board.childNodes[7].style.background = "url('images/chance-pink.svg') no-repeat";
    board.childNodes[7].style.backgroundColor = "";
    board.childNodes[7].style.backgroundSize = "68px 66px";

    board.childNodes[22].style.background = "url('images/chance-blue.svg') no-repeat";
    board.childNodes[22].style.backgroundColor = "";
    board.childNodes[22].style.backgroundSize = "68px 66px";

    board.childNodes[36].style.background = "url('images/chance-orange.svg') no-repeat";
    board.childNodes[36].style.backgroundColor = "";
    board.childNodes[36].style.backgroundSize = "68px 66px";

    board.childNodes[38].style.background = "url('images/luxury-tax.svg') no-repeat";
    board.childNodes[38].style.backgroundColor = "";
    board.childNodes[38].style.backgroundSize = "68px 66px";

    [2, 17, 33].forEach(placeIdx => {
        board.childNodes[placeIdx].style.background = "url('images/community-chest.svg') no-repeat";
        board.childNodes[placeIdx].style.backgroundColor = "";
        board.childNodes[placeIdx].style.backgroundSize = "68px 66px";
    });

    board.childNodes[30].style.background = "url('images/go-to-jail.svg') no-repeat";
    board.childNodes[30].style.backgroundColor = "";
    board.childNodes[30].style.backgroundSize = "68px 66px";

    board.childNodes[20].style.background = "url('images/free-parking.svg') no-repeat";
    board.childNodes[20].style.backgroundColor = "";
    board.childNodes[20].style.backgroundSize = "68px 66px";

    // board.childNodes[10].style.background = "url('images/in-jail.svg') no-repeat";
    // board.childNodes[10].style.backgroundColor = "";
    // board.childNodes[10].style.backgroundSize = "68px 66px";

    const jail = document.createElement("div");
    jail.id = "jail";
    board.childNodes[10].appendChild(jail);

    const jailVerticalWalkway = document.createElement("div");
    jailVerticalWalkway.id = "jail-vertical-walkway";
    board.childNodes[10].appendChild(jailVerticalWalkway);

    const jailHorizontalWalkway = document.createElement("div");
    jailHorizontalWalkway.id = "jail-horizontal-walkway";
    board.childNodes[10].appendChild(jailHorizontalWalkway);

    $(".location").click(function() {
        const placeIdx = parseInt(this.dataset.no);
        showCard(placeIdx);
    });
}

function buildPlayerViews() {
    // Build each player view.

    const board = document.getElementById("board");

    players.forEach((player, i) => {
        const circ = document.createElement("img");    
        circ.id = "marker" + i;
        circ.className = "circ";
        circ.src = "https://cdn.bulbagarden.net/upload" + player.spriteFileName;
        circ.addEventListener("click", event => {
            slide(i);
            event.stopPropagation();
        });
        circ.addEventListener("mouseover", event => {
            toggleHighlightedProperties(i, true);
        });
        circ.addEventListener("mouseout", event => {
            toggleHighlightedProperties(i, false);
        });

        board.childNodes[0].appendChild(circ);

        const heads = document.getElementById("heads");
        heads.innerHTML += "<div id='head" + i + "' class='player-display-head'></div>";
        heads.innerHTML += "<div style='background-color:rgb(68, 136, 204);height:5px'></div>";
        heads.innerHTML += `<div class='dashboard' id='user${i}' style='display:none'><span id='property-list${i}'></span><span id='jail-card${i}'></div>`;
    });
}

function buildPlayerDisplays() {
    // Set up the HUD for each player: name, location, and balance.
    players.forEach((player, i) => {
        const sprite = "<img class='display-sprite' src='https://cdn.bulbagarden.net/upload" + player.spriteFileName + "'>";
        $("#head" + i).html(sprite + player.name + ": <span id='loc" + i + "'>Go</span><div style='float:right' id='bal" + i + "'>$1500</div>");    

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

function toggleHighlightedProperties(userId, shouldShow) {
    const ownedProperties = places
        .map((place, placeId) => [placeId, place.own])
        .filter(([placeId, owner]) => owner === userId);

    ownedProperties.forEach(([placeId, ]) => highlightProperty(placeId, shouldShow));
}

function highlightProperty(placeId, shouldShow) {
    const jqLocation = $(".location:eq(" + placeId + ")");
    if (jqLocation.has(".walkway").length) {
        jqLocation.children(".walkway").toggleClass("location-highlighted", shouldShow);
    } else {
        jqLocation.toggleClass("location-highlighted", shouldShow);
    }    
}

const randomPlayer = players[Math.floor(Math.random() * players.length)];

const GlobalState = {
    currentPlayer: randomPlayer,
    tax: 0,
    waitingForUserResponse: undefined
}

function startUp() {
    buildGameBoard();
    buildPlayerViews();
    buildPlayerDisplays();

    const nextPlayer = players[(GlobalState.currentPlayer.num + 1) % players.length];
    $("#initial-turn").text(nextPlayer.name);
}

export {
    GlobalState,
    JAIL_VERTICAL_WALKWAY_CAPACITY,
    toggleHighlightedProperties,
    highlightProperty,
    players,
    slide,
    startUp
};