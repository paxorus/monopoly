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

import {players, startUp, updateTurn, GlobalState} from "/javascripts/startup.js";
window.players = players;
window.GlobalState = GlobalState;

import {hideLocationCard} from "/javascripts/display-card.js";
window.hideLocationCard = hideLocationCard;

import {log} from "/javascripts/message-box.js";
window.log = log;

const socket = io();
window.socket = socket;

socket.on("start-up", ({newPlayers, yourPlayerNum, startingPlayerNum}) => {
	newPlayers.forEach(player => {
		players.push(new Player(player.name, player.num, player.spriteFileName));
	});

	startUp(yourPlayerNum, startingPlayerNum);
});

// Updates
socket.on("log", text => {
	console.log("log", text);
	log(text);
});

socket.on("update-balance", ({playerId, balance}) => {
	players[playerId].updateBalance(balance);
});

socket.on("update-location", ({playerId, placeIdx}) => {
	players[playerId].updateLocation(placeIdx);
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
	purchaseProperty(players[playerId], placeIdx);
});

socket.on("build-house-buttons", ({placeIdx}) => {
	buildHouseButtons(placeIdx);
});

socket.on("buy-house", ({playerId, placeIdx}) => {
	buyHouse(players[playerId], placeIdx);
});

socket.on("sell-house", ({playerId, placeIdx}) => {
	sellHouse(players[playerId], placeIdx);
});

// Jail actions
socket.on("go-to-jail", ({playerId}) => {
	players[playerId].goToJail();
});

socket.on("get-out-of-jail", ({playerId}) => {
	players[playerId].getOutOfJail();
});

socket.on("add-jail-card", ({playerId}) => {
	addGetOutOfJailFreeCard(players[playerId]);
});

socket.on("use-jail-card", ({playerId}) => {
	updateGetOutOfJailFreeCards(players[playerId]);
});

socket.on("update-jail-days", ({playerId, jailDays}) => {
	players[playerId].updateJailDays(jailDays);
});

socket.on("offer-pay-out-of-jail", () => {
	offerPayOutOfJail();
});

// Mortgage actions
socket.on("mortgage-property", ({playerId, placeIdx}) => {
	mortgageProperty(players[playerId], placeIdx);
});

socket.on("unmortgage-property", ({playerId, placeIdx}) => {
	unmortgageProperty(players[playerId], placeIdx);
});

socket.emit("start-up", {
	secretKey
});
