import {showCard} from "./display-card.js";
import {places, Locations} from "./location-configs.js";
import Player from "./player.js";
import {log, MessageBox} from "./message-box.js";

const JAIL_VERTICAL_WALKWAY_CAPACITY = 3;

const GlobalState = {
	players: undefined,
	me: undefined,
	tax: 0
}

function buildGameBoard() {
	// Build and place all board locations on DOM.

	const board = document.getElementById("board");

	places.forEach((place, placeIdx) => {
		const newdiv = document.createElement("div");
		newdiv.dataset.no = placeIdx;
		const indiv = document.createElement("div");
		newdiv.style.backgroundColor = place.color;
		
		switch (Math.floor(placeIdx / 10)) {
			case 0:
				newdiv.className = "location bottom";
				newdiv.style.left = 70 * (10 - placeIdx) + "px";
				indiv.style.bottom = 0;
				indiv.className = "walkway horizontal";
				break;
			case 1:
				newdiv.className = "location left";
				newdiv.style.top = 680 - 68 * (placeIdx - 10) + "px";
				indiv.style.left = 0;
				indiv.className = "walkway vertical";
				break;
			case 2:
				newdiv.className = "location top";
				newdiv.style.left = 70 * (placeIdx - 20) + "px";
				indiv.style.top = 0;
				indiv.className = "walkway horizontal";
				break;
			case 3:
				newdiv.className = "location right";
				newdiv.style.top = 68 * (placeIdx - 30) + "px";
				indiv.style.right = 0;
				indiv.className = "walkway vertical";
				break;
		}

		if (place.imageName) {
			setLocationImage(newdiv, place.imageName);
		}

		// Add a neutral-colored walkway for house-able properties.
		if (place.housePrice) {
			newdiv.appendChild(indiv);
		}
		board.appendChild(newdiv);
	});

	// Free Parking: add #alltax
	board.childNodes[Locations.FreeParking].id = "alltax";

	buildJailLocation(board.childNodes[Locations.Jail]);

	$(".location").click(function() {
		const placeIdx = parseInt(this.dataset.no);
		showCard(placeIdx);
	});
}

function setLocationImage(location, imageName) {
	location.style.background = `url('${imageName}') no-repeat`;
	location.style.backgroundColor = "";
	location.style.backgroundSize = "68px 66px";
}

function buildJailLocation(jailLocation) {
	const jail = document.createElement("div");
	jail.id = "jail";
	jailLocation.appendChild(jail);

	const jailVerticalWalkway = document.createElement("div");
	jailVerticalWalkway.id = "jail-vertical-walkway";
	jailLocation.appendChild(jailVerticalWalkway);

	const jailHorizontalWalkway = document.createElement("div");
	jailHorizontalWalkway.id = "jail-horizontal-walkway";
	jailLocation.appendChild(jailHorizontalWalkway);
}

function buildPlayerViews(players) {
	// Build player sprites and place them at Go.
	const board = document.getElementById("board");

	players.forEach((player, i) => {
		const playerSprite = player.buildSprite();
		board.childNodes[Locations.Go].appendChild(playerSprite);
	});
}

function buildPlayerDashboards(players) {
	// Set up the HUD for each player: name, location, and balance.
	players.forEach((player, i) => {
		const sprite = "<img class='display-sprite' src='https://cdn.bulbagarden.net/upload" + player.spriteFileName + "'>";

		const heads = document.getElementById("heads");
		heads.innerHTML += "<div id='head" + i + "' class='player-display-head'></div>";
		heads.innerHTML += "<div style='background-color:rgb(68, 136, 204);height:5px'></div>";
		heads.innerHTML += `<div class='dashboard' id='user${i}' style='display:none'><span id='property-list${i}'></span><span id='jail-card${i}'></div>`;

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
	GlobalState.players.forEach((player, i) => {
		if (i != user) {
			$("#user" + i).slideUp();
		} else {
			$("#user" + i).slideDown();
		}
	});
}

function toggleHighlightedProperties(userId, shouldShow) {
	const ownedProperties = places
		.map((place, placeId) => [placeId, place.ownerNum])
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

function startUp({newPlayers, yourPlayerNum, startingPlayerNum}) {

	const players = newPlayers.map(player => new Player(player.name, player.num, player.spriteFileName));

	buildGameBoard();
	buildPlayerViews(players);
	buildPlayerDashboards(players);

	GlobalState.me = players[yourPlayerNum];

	if (yourPlayerNum === startingPlayerNum) {
		$("#initial-interactive").css("display", "block");
	} else {
		$("#waiting-on-player").css("display", "block");
		$("#current-player-name").text(players[startingPlayerNum].name);
	}

	GlobalState.players = players;
}

function updateTurn(nextPlayerId) {
	if (nextPlayerId === GlobalState.me.num) {
		$("#waiting-on-player").css("display", "none");
		$("#execute-turn").css("display", "block");
		$("#interactive").css("display", "block");
		MessageBox.clear();
	} else {
		log(`It's ${GlobalState.players[nextPlayerId].name}'s turn.`);
	}
}

export {
	GlobalState,
	JAIL_VERTICAL_WALKWAY_CAPACITY,
	toggleHighlightedProperties,
	highlightProperty,
	slide,
	startUp,
	updateTurn
};