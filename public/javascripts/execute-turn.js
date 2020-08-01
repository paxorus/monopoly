import {showCard} from "./display-card.js";
import {places, propertyComparator, MONOPOLIES} from "./location-configs.js";
import {log, MessageBox} from "./message-box.js";
import {highlightProperty, GlobalState} from "./game-board.js";

function allowConcludeTurn() {
	// Show "End Turn" button.
	$("#end-turn").css("display", "block");
}

function advanceTurn() {
	// Hide "End Turn" button.
	$("#end-turn").css("display", "none");
	socket.emit("advance-turn");
}

function updateTurn(nextPlayerId) {
	// Display whose turn it is.
	if (nextPlayerId === GlobalState.me.num) {
		$("#waiting-on-player").css("display", "none");
		$("#execute-turn").css("display", "block");
		$("#interactive").css("display", "block");
		MessageBox.clear();
	} else {
		log(`It's ${GlobalState.players[nextPlayerId].name}'s turn.`);
	}
}

function executeTurn() {
	socket.emit("execute-turn", {playerId: GlobalState.me.num});

	// Switch to the normal interactive; only applicable on the first turn.
	$("#initial-interactive").css("display", "none");
	$("#interactive").css("display", "block");

	// Set up the message box.
	$("#execute-turn").css("display", "none");
	MessageBox.clear();
}

function offerUnownedProperty(mover, placeIdx) {
	const place = places[placeIdx];
	log(mover.name + ", would you like to buy " + place.name + " for $" + place.price + "?");
	$("#button-box").append("<div class='button' onclick='respondToBuyOffer(true)'>Buy " + place.name + "</div>");
	$("#button-box").append("<div class='button-negative' onclick='respondToBuyOffer(false)'>No Thanks</div>");
}

function respondToBuyOffer(ifBuy) {
	// Hide the Buy/No buttons.
	$("#button-box").children().remove();

	socket.emit("respond-to-buy-offer", {playerId: GlobalState.me.num, ifBuy});
}

function purchaseProperty(mover, placeIdx) {
	const place = places[placeIdx];
	place.ownerNum = mover.num;

	const propertyListing = document.createElement("div");
	propertyListing.id = "hud-property" + placeIdx;
	propertyListing.className = "hud-property";

	const propertyColor = document.createElement("div");
	propertyColor.className = "hud-property-color";
	propertyColor.style.backgroundColor = place.color;
	propertyListing.appendChild(propertyColor);

	const propertyName = document.createElement("span");
	propertyName.className = "hud-property-name";
	propertyName.textContent = place.name;
	propertyName.addEventListener("mouseover", event => highlightProperty(placeIdx, true));
	propertyName.addEventListener("mouseout", event => highlightProperty(placeIdx, false));
	propertyName.addEventListener("click", event => showCard(placeIdx));
	propertyListing.appendChild(propertyName);

	propertyListing.appendChild(buildMortgageButton(mover, placeIdx));

	const propertyList = document.getElementById("property-list" + mover.num);

	const nextElement = [...propertyList.children].find(listing => {
		const otherPlaceIdx = parseInt(listing.id.substring("hud-property".length), 10);
		return propertyComparator(placeIdx, otherPlaceIdx) < 0;
	});
	if (nextElement !== undefined) {
		propertyList.insertBefore(propertyListing, nextElement);
	} else {
		propertyList.appendChild(propertyListing);
	}
}

function buildHouseButtons(placeIdx) {
	const owner = GlobalState.me;

	const adder = document.createElement("div");
	adder.className = "button house-button house-adder";
	adder.title = "Buy a House";
	$(adder).append("<img class='house-icon' src='/images/house.svg'><sup class='house-plus-sign'>+</sup>");
	adder.addEventListener("click", event => socket.emit("buy-house", {playerId: owner.num, placeIdx}));
	$("#hud-property" + placeIdx).append(adder);

	const remover = document.createElement("div");
	remover.className = "button-negative button-disabled house-button house-remover";
	remover.title = "Sell a House";
	$(remover).append("<img class='house-icon' src='/images/house.svg'><sup class='house-minus-sign'>-</sup>");
	remover.addEventListener("click", event => socket.emit("sell-house", {playerId: owner.num, placeIdx}));
	$("#hud-property" + placeIdx).append(remover);
}

function buildMortgageButton(owner, placeIdx) {
	const mortgager = document.createElement("div");
	mortgager.className = "button house-button property-mortgager";
	mortgager.title = "Mortgage the Property";
	$(mortgager).append("<img class='house-icon' src='/images/mortgage.svg'><sup class='mortgage-symbol'>$</sup>");
	mortgager.addEventListener("click", event => mortgageOrUnmortgageProperty(owner, placeIdx));
	return mortgager;
}

function buyHouse(owner, placeIdx) {
	const place = places[placeIdx];
	place.houseCount ++;

	// Enable the - button.
	$("#hud-property" + placeIdx + " > .house-remover").toggleClass("button-disabled", false);

	// Disable the mortgage button.
	$("#hud-property" + placeIdx + " > .property-mortgager").toggleClass("button-disabled", true);

	if (place.houseCount === 5) {
		$("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", true);
		repeat(4, () => removeBuildingIcon(placeIdx));
		addBuildingIcon(placeIdx, "hotel");
	} else {
		addBuildingIcon(placeIdx, "house");
	}
}

function sellHouse(owner, placeIdx) {
	const place = places[placeIdx];
	place.houseCount --;

	// Enable the + button.
	$("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", false);

	if (place.houseCount === 4) {
		repeat(4, () => addBuildingIcon(placeIdx, "house"));
		removeBuildingIcon(placeIdx);
		return;
	}

	if (place.houseCount === 0) {
		$("#hud-property" + placeIdx + " > .house-remover").toggleClass("button-disabled", true);
		$("#hud-property" + placeIdx + " > .property-mortgager").toggleClass("button-disabled", false);
	}

	removeBuildingIcon(placeIdx);
}

function addBuildingIcon(placeIdx, buildingType) {
	const houseImage = document.createElement("img");
	houseImage.src = "/images/" + buildingType + ".svg";
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
		socket.emit("unmortgage-property", {playerId: owner.num, placeIdx});
		return;
	}

	// Button disabled, do nothing.
	if (place.houseCount > 0) {
		return;
	}

	socket.emit("mortgage-property", {playerId: owner.num, placeIdx});
}

function mortgageProperty(owner, placeIdx) {
	const place = places[placeIdx];
	place.isMortgaged = true;

	if (owner === GlobalState.me) {
		const button = $("#hud-property" + placeIdx + " > .property-mortgager");
		button.children(".mortgage-symbol").text("!");
		button.toggleClass("button button-negative");
		button.attr("title", "Unmortgage the Property");

		$("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", true);
	}
}

function unmortgageProperty(owner, placeIdx) {
	const place = places[placeIdx];
	place.isMortgaged = false;

	if (owner === GlobalState.me) {
		const button = $("#hud-property" + placeIdx + " > .property-mortgager");
		button.children(".mortgage-symbol").text("$");
		button.toggleClass("button button-negative");
		button.attr("title", "Mortgage the Property");

		$("#hud-property" + placeIdx + " > .house-adder").toggleClass("button-disabled", false);
	}
}

function offerPayOutOfJail() {
	const mover = GlobalState.me;

	const turns = (mover.jailDays > 1) ? "turns" : "turn";
	log("No double... " + mover.name + ", you have " + mover.jailDays + " " + turns + " remaining on your sentence.");
	log(mover.name + ", would you like to pay $50 to get out of jail?");
	$("#button-box").append("<div class='button' onclick='respondPayOutOfJail(true)'>Pay $50</div>");
	$("#button-box").append("<div class='button-negative' onclick='respondPayOutOfJail(false)'>No Thanks</div>");
}

function respondPayOutOfJail(hasAgreed) {
	// Hide the Pay/No buttons.
	$("#button-box").children().remove();

	if (! hasAgreed) {
		allowConcludeTurn();
	} else {
		socket.emit("pay-out-of-jail", {playerId: GlobalState.me.num});
	}
}

function addGetOutOfJailFreeCard(mover) {
	mover.numJailCards ++;

	if (mover.numJailCards === 1) {
		const isUsageEnabled = mover.jailDays > 0 ? "" : "button-disabled";
		$("#jail-card" + mover.num).append(`<br />Get Out of Jail Free<span id='jail-card-quantity${mover.num}'></span>`);

		if (mover === GlobalState.me) {
			$("#jail-card" + mover.num).append(`<span class='button ${isUsageEnabled} use-jail-card' onclick='useGetOutOfJailFreeCard()'>Use Card</div>`);
		}
	} else {
		$("#jail-card-quantity" + mover.num).text(" x" + mover.numJailCards);
	}
}

function useGetOutOfJailFreeCard(player) {
	socket.emit("use-jail-card", {playerId: GlobalState.me.num});
}

function updateGetOutOfJailFreeCards(player) {
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

export {
	addGetOutOfJailFreeCard,
	advanceTurn,
	allowConcludeTurn,
	buildHouseButtons,
	buyHouse,
	executeTurn,
	mortgageProperty,
	offerPayOutOfJail,
	offerUnownedProperty,
	purchaseProperty,
	respondToBuyOffer,
	respondPayOutOfJail,
	sellHouse,
	unmortgageProperty,
	updateGetOutOfJailFreeCards,
	updateTurn,
	useGetOutOfJailFreeCard
};