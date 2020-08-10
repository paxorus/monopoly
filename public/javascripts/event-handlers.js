import {
	allowConcludeTurn,
	addGetOutOfJailFreeCard,
	advanceTurn,
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
} from "/javascripts/execute-turn.js";

// UI callbacks
window.advanceTurn = advanceTurn;
window.executeTurn = executeTurn;
window.mortgageProperty = mortgageProperty;
window.respondToBuyOffer = respondToBuyOffer;
window.respondPayOutOfJail = respondPayOutOfJail;
window.unmortgageProperty = unmortgageProperty;
window.useGetOutOfJailFreeCard = useGetOutOfJailFreeCard;

import Player from "/javascripts/player.js";
window.Player = Player;

import {startUp} from "/javascripts/start-up.js";

import {GlobalState} from "/javascripts/game-board.js";
window.GlobalState = GlobalState;

import {hideLocationCard} from "/javascripts/display-card.js";
window.hideLocationCard = hideLocationCard;

import {log} from "/javascripts/message-box.js";
window.log = log;

const socket = io();
window.socket = socket;

socket.on("start-up", startUp);

// Updates
socket.on("log", text => {
	console.log("log", text);
	log(text);
});

socket.on("update-balance", ({playerId, balance}) => {
	GlobalState.players[playerId].updateBalance(balance);
});

socket.on("update-location", ({playerId, placeIdx}) => {
	GlobalState.players[playerId].updateLocation(placeIdx);
});

// Turn actions
socket.on("allow-conclude-turn", () => {
	allowConcludeTurn();
});

socket.on("advance-turn", ({nextPlayerId}) => {
	updateTurn(nextPlayerId);
});

// Property actions
socket.on("offer-unowned-property", ({placeIdx}) => {
	offerUnownedProperty(GlobalState.me, placeIdx);
});

socket.on("purchase-property", ({playerId, placeIdx}) => {
	purchaseProperty(GlobalState.players[playerId], placeIdx);
});

socket.on("build-house-buttons", ({placeIdx}) => {
	buildHouseButtons(placeIdx);
});

socket.on("buy-house", ({playerId, placeIdx}) => {
	buyHouse(GlobalState.players[playerId], placeIdx);
});

socket.on("sell-house", ({playerId, placeIdx}) => {
	sellHouse(GlobalState.players[playerId], placeIdx);
});

// Jail actions
socket.on("go-to-jail", ({playerId}) => {
	GlobalState.players[playerId].goToJail();
});

socket.on("get-out-of-jail", ({playerId}) => {
	GlobalState.players[playerId].getOutOfJail();
});

socket.on("add-jail-card", ({playerId}) => {
	addGetOutOfJailFreeCard(GlobalState.players[playerId]);
});

socket.on("use-jail-card", ({playerId}) => {
	updateGetOutOfJailFreeCards(GlobalState.players[playerId]);
});

socket.on("update-jail-days", ({playerId, jailDays}) => {
	GlobalState.players[playerId].updateJailDays(jailDays);
});

socket.on("offer-pay-out-of-jail", () => {
	offerPayOutOfJail();
});

// Tax actions
socket.on("update-tax", ({tax}) => {
	GlobalState.tax = tax;
});

// Mortgage actions
socket.on("mortgage-property", ({playerId, placeIdx}) => {
	mortgageProperty(GlobalState.players[playerId], placeIdx);
});

socket.on("unmortgage-property", ({playerId, placeIdx}) => {
	unmortgageProperty(GlobalState.players[playerId], placeIdx);
});

function initializeGame() {
	socket.emit("start-up", {
		secretKey
	});
}

export {
	initializeGame
};