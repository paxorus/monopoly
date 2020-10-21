const {places, Locations} = require("./location-configs.js");

module.exports = class Player {
	constructor(name, userId, num, spriteFileName, game) {
		this.name = name;
		this.userId = userId;
		this.num = num;
		this.spriteFileName = spriteFileName;
		this.game = game;

		this.latestRoll = null;
		this.rollCount = 0;
		this.balance = 1500;
		this.placeIdx = Locations.Go;
		
		this.jailDays = 0;
		this.numJailCards = 0;

		this.socket = null;
		this.savedMessages = [];
	}

	decrementJailDays(jailDays) {
		this.jailDays --;
		this.io.emit("update-jail-days", {playerId: this.num, jailDays: this.jailDays});
	}

	goToJail() {
		this.log("You will be in jail for 3 turns!");
		this.updateLocation(Locations.Jail);
		this.jailDays = 3;
		this.io.emit("go-to-jail", {playerId: this.num});
	}

	getOutOfJail() {
		this.log("You are now out of jail!");
		this.jailDays = 0;
		this.io.emit("get-out-of-jail", {playerId: this.num});
	}

	updateBalance(income) {
		this.balance += income;
		this.io.emit("update-balance", {playerId: this.num, balance: this.balance});
	}

	updateLocation(newLocation) {
		this.placeIdx = newLocation;
		this.io.emit("update-location", {playerId: this.num, placeIdx: this.placeIdx});
	}

	configureEmitter(io, socket) {
		this.socket = socket;
		this.io = io;
	}

	emit(eventName, message) {
		this.socket.emit(eventName, message);
		this.saveMessage(eventName, message);
	}

	emitToAll(eventName, message) {
		this.io.emit(eventName, message);
		this.saveMessage(eventName, message);
	}

	saveMessage(eventName, message) {
		// Save messages of a player's most recent turn, to re-serve them on a page load.
		switch (eventName) {
			case "allow-conclude-turn":
			case "offer-pay-out-of-jail":
			case "offer-unowned-property":
			case "log":
				this.savedMessages.push([eventName, message]);
				break;

			case "advance-turn":
				if (this.num === message.nextPlayerId) {
					// Clear messages when going to show player the "Execute Turn" button.
					this.savedMessages = [];
				} else {
					this.savedMessages.push([eventName, message]);
				}
				break;
		}
	}

	log(message) {
		this.emit("log", message);
	}
}
