require("../array-monkey-patch.js");
const Data = require("../storage/data.js");
const {Locations} = require("../game-logic/location-configs.js");

/**
 * A serializable representation of a player.
 * Namely, it does not reference the Game or Socket objects.
 */
class PlayerRecord {
	constructor(name, userId, num, spriteFileName) {
		this.name = name;
		this.userId = userId;
		this.num = num;
		this.spriteFileName = spriteFileName;

		this.latestRoll = null;
		this.rollCount = 0;
		this.balance = 1500;
		this.placeIdx = Locations.Go;

		this.jailDays = 0;
		this.numJailCards = 0;

		// TODO: Consider renaming to messagesToReplay.
		this.savedMessages = [];
	}
}

class Player {
	constructor(playerRecord, game) {
		this.name = playerRecord.name;
		this.userId = playerRecord.userId;
		this.num = playerRecord.num;
		this.spriteFileName = playerRecord.spriteFileName;

		this.latestRoll = playerRecord.latestRoll;
		this.rollCount = playerRecord.rollCount;
		this.balance = playerRecord.balance;
		this.placeIdx = playerRecord.placeIdx;
		
		this.jailDays = playerRecord.jailDays;
		this.numJailCards = playerRecord.numJailCards;
		this.savedMessages = playerRecord.savedMessages;

		this.game = game;
		this.sockets = [];
		this.io = null;
	}

	decrementJailDays(jailDays) {
		this.jailDays --;

		if (this.io !== null) {
			this.io.emit("update-jail-days", {playerId: this.num, jailDays: this.jailDays});
		}
	}

	goToJail() {
		this.log("You will be in jail for 3 turns!");
		this.updateLocation(Locations.Jail);
		this.jailDays = 3;

		if (this.io !== null) {
			this.io.emit("go-to-jail", {playerId: this.num});
		}
	}

	getOutOfJail() {
		this.log("You are now out of jail!");
		this.jailDays = 0;

		if (this.io !== null) {
			this.io.emit("get-out-of-jail", {playerId: this.num});
		}
	}

	updateBalance(income) {
		this.balance += income;

		if (this.io !== null) {
			this.io.emit("update-balance", {playerId: this.num, balance: this.balance});
		}
	}

	updateLocation(newLocation) {
		this.placeIdx = newLocation;

		// TODO: Why not use emitToAll() here?
		if (this.io !== null) {
			this.io.emit("update-location", {playerId: this.num, placeIdx: this.placeIdx});
		}
	}

	configureEmitter(io, socket) {
		this.sockets.push(socket);
		this.io = io;
		console.log(`add socket for player ${this.num}: ${this.sockets.length} total`);
	}

	removeEmitter(socket) {
		this.sockets.remove(socket);
		console.log(`remove socket for player ${this.num}: ${this.sockets.length} total`);
	}

	emit(eventName, message) {
		// console.log(eventName, message, this.num);
		this.sockets.forEach(socket => socket.emit(eventName, message));
		this._saveMessage(eventName, message);
	}

	emitToAll(eventName, message) {
		// TODO: Consider renaming to emitToEveryone(), since emit() emits to all devices.
		this.game.players.forEach(player => player.emit(eventName, message));
	}

	_saveMessage(eventName, message) {
		// Save messages of a player's most recent turn, to re-serve them on a page load.
		switch (eventName) {
			case "allow-conclude-turn":
			case "offer-pay-out-of-jail":
			case "offer-unowned-property":
			case "log":
				this.addToSavedMessages([eventName, message]);
				break;

			case "advance-turn":
				if (this.num === message.nextPlayerId) {
					// If it's now this player's turn, clear messages from last turn before showing
					// player the "Execute Turn" button.
					this.setSavedMessages([[eventName, message]]);
				} else {
					this.addToSavedMessages([eventName, message]);
				}
				break;
		}
	}

	log(message) {
		this.emit("log", message);
	}

	getSavedMessages() {
		return this.savedMessages;
	}

	setSavedMessages(savedMessages) {
		this.savedMessages = savedMessages;
	}

	addToSavedMessages(message) {
		this.savedMessages.push(message);
	}

	serialize() {
		const record = new PlayerRecord(this.name, this.userId, this.num, this.spriteFileName);

		record.latestRoll = this.latestRoll;
		record.rollCount = this.rollCount;
		record.balance = this.balance;
		record.placeIdx = this.placeIdx;

		record.jailDays = this.jailDays;
		record.numJailCards = this.numJailCards;

		record.savedMessages = this.savedMessages;

		return record;
	}
}

const PlayerIcons = [
	"https://cdn2.bulbagarden.net/upload/thumb/5/58/384Rayquaza-Mega.png/900px-384Rayquaza-Mega.png",
	"https://cdn2.bulbagarden.net/upload/thumb/8/81/644Zekrom.png/375px-644Zekrom.png",
	"https://cdn2.bulbagarden.net/upload/archive/8/8a/20190407154255%21483Dialga.png"
];

module.exports = {
	PlayerRecord,
	Player,
	PlayerIcons
};