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

	collectGoMoney() {
		this.updateBalance(200);
		this.log("Collected $200 for passing Go.");
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

		// TODO: Consider switching to emitToEveryone() here. More readable and will step through _saveMessage.
		if (this.io !== null) {
			this.io.emit("update-location", {playerId: this.num, placeIdx: this.placeIdx});
		}
	}

	configureEmitter(io, socket) {
		this.sockets.push(socket);
		this.io = io;
		// console.log(`add socket for player ${this.num}: ${this.sockets.length} total`);
	}

	removeEmitter(socket) {
		this.sockets.remove(socket);
		// console.log(`remove socket for player ${this.num}: ${this.sockets.length} total`);
	}

	emit(eventName, message) {
		// console.log(eventName, message, this.num);
=		this.sockets.forEach(socket => socket.emit(eventName, message));
		this._saveMessage(eventName, message);
	}

	emitToEveryone(eventName, message) {
		this.game.players.forEach(player => player.emit(eventName, message));
	}

	emitToEveryoneElse(eventName, message) {
		this.game.players
			.filter(player => player !== this)
			.forEach(player => player.emit(eventName, message));
	}

	_saveMessage(eventName, message) {
		// Save messages of a player's most recent turn, to re-serve them on a page load.
		switch (eventName) {
			case "allow-conclude-turn":
			case "offer-pay-out-of-jail":
			case "offer-unowned-property":
			case "dialog":
			case "notify":
				this.addToSavedMessages([eventName, message]);
				break;

			case "advance-turn":
				if (this.num === message.nextPlayerId) {
					// If it's now this player's turn, clear messages from last turn before showing
					// player the "Take Your Turn" button.
					this.setSavedMessages([[eventName, message]]);
				} else {
					this.addToSavedMessages([eventName, message]);
				}
				break;
		}
	}

	log(message) {
		// Dialog relating to your turn.
		this.emit("dialog", message);
	}

	notify(message) {
		// Notifications relating to actions that can be taken any time or about other players, e.g. trades, rent paid to you.
		this.emit("notify", message);
	}

	notifyEveryoneElse(message) {
		this.emitToEveryoneElse("notify", message);		
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
	"https://cdn2.bulbagarden.net/upload/thumb/0/0d/025Pikachu.png/240px-025Pikachu.png",
	"https://cdn2.bulbagarden.net/upload/archive/6/60/20091223220130%21258Mudkip.png",
	"https://cdn2.bulbagarden.net/upload/archive/2/2c/20091223215948%21252Treecko.png",
	"https://cdn2.bulbagarden.net/upload/archive/9/91/20091223220041%21255Torchic.png",
	"https://cdn2.bulbagarden.net/upload/archive/c/ca/20090820000257%21092Gastly.png",
	"https://cdn2.bulbagarden.net/upload/archive/d/d8/20100219173940%21386Deoxys-Attack.png",
	"https://cdn2.bulbagarden.net/upload/thumb/f/f1/382Kyogre-Primal.png/240px-382Kyogre-Primal.png",
	"https://cdn2.bulbagarden.net/upload/thumb/5/58/384Rayquaza-Mega.png/240px-384Rayquaza-Mega.png",
	"https://cdn2.bulbagarden.net/upload/thumb/8/81/644Zekrom.png/240px-644Zekrom.png",
	"https://cdn2.bulbagarden.net/upload/thumb/8/8a/483Dialga.png/240px-483Dialga.png",
];

module.exports = {
	PlayerRecord,
	Player,
	PlayerIcons
};