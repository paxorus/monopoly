import {showCard} from "./display-card.js";
import {places, Locations} from "./location-configs.js";

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
		const locationSquare = document.createElement("div");
		locationSquare.dataset.no = placeIdx;
		locationSquare.style.backgroundColor = place.color;

		const walkway = document.createElement("div");
		const housePlot = document.createElement("div");
		housePlot.id = "house-plot" + placeIdx;

		switch (Math.floor(placeIdx / 10)) {
			case 0:
				locationSquare.className = "location bottom";
				locationSquare.style.left = 70 * (10 - placeIdx) + "px";
				walkway.style.bottom = 0;
				walkway.className = "walkway horizontal";
				break;
			case 1:
				locationSquare.className = "location left";
				locationSquare.style.top = 680 - 68 * (placeIdx - 10) + "px";
				walkway.style.left = 0;
				walkway.className = "walkway vertical";
				housePlot.className = "house-plot-left";
				break;
			case 2:
				locationSquare.className = "location top";
				locationSquare.style.left = 70 * (placeIdx - 20) + "px";
				walkway.style.top = 0;
				walkway.className = "walkway horizontal";
				housePlot.className = "house-plot-top";
				break;
			case 3:
				locationSquare.className = "location right";
				locationSquare.style.top = 68 * (placeIdx - 30) + "px";
				walkway.style.right = 0;
				walkway.className = "walkway vertical";
				housePlot.className = "house-plot-right";
				break;
		}

		if (place.imageName) {
			setLocationImage(locationSquare, place.imageName);
		}

		// Add a neutral-colored walkway for house-able properties.
		if (place.housePrice) {
			locationSquare.appendChild(walkway);
			locationSquare.appendChild(housePlot);
		}
		board.appendChild(locationSquare);
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

	players.forEach(player => {
		const playerSprite = player.buildSprite();
		board.childNodes[player.placeIdx].appendChild(playerSprite);
	});
}

function buildPlayerDashboards(players) {
	// Set up the HUD for each player: name, location, and balance.
	players.forEach((player, i) => {
		// Build header.
		const header = document.createElement("div");
		header.id = "head" + i;
		header.className = "player-display-head";

		const sprite = document.createElement("img");
		sprite.className = "display-sprite";
		sprite.src = "https://cdn.bulbagarden.net/upload" + player.spriteFileName;

		const location = document.createElement("span");
		location.id = "loc" + i;
		const balance = document.createElement("div");
		balance.id = "bal" + i;
		balance.style.float = "right";
		balance.appendChild(document.createTextNode("$" + player.balance));

		header.appendChild(sprite);
		header.appendChild(document.createTextNode(player.name + ": "));
		header.appendChild(location);
		header.appendChild(balance);

		// Build divider.
		const bar = document.createElement("div");
		bar.className = "dashboard-divider";

		// Build dashboard.
		const dashboard = document.createElement("div");
		dashboard.id = "user" + i;
		dashboard.style.display = "none";
		dashboard.className = "dashboard";

		const propertyList = document.createElement("span");
		propertyList.id = "property-list" + i;
		const jailCards = document.createElement("span");
		jailCards.id = "jail-card" + i;

		dashboard.appendChild(propertyList);
		dashboard.appendChild(jailCards);

		// Expand HUD on click.
		header.addEventListener("click", event => {
			if (dashboard.style.display === "none") {
				slide(i);
			}
		});

		$("#heads").append(header, bar, dashboard);
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

function buildAllViews(players) {
	buildGameBoard();
	buildPlayerViews(players);
	buildPlayerDashboards(players);
}

export {
	buildAllViews,
	GlobalState,
	highlightProperty,
	JAIL_VERTICAL_WALKWAY_CAPACITY,
	slide,
	toggleHighlightedProperties
};