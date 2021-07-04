const {Locations} = require("./location-configs.js");

/**
 * A representation of a player that is safe for transmission and DB persistence.
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
		this.socket = null;
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

		if (this.io !== null) {
			this.io.emit("update-location", {playerId: this.num, placeIdx: this.placeIdx});
		}
	}

	configureEmitter(io, socket) {
		this.socket = socket;
		this.io = io;
	}

	emit(eventName, message) {
		if (this.socket !== null) {
			this.socket.emit(eventName, message);			
		}
		this._saveMessage(eventName, message);
	}

	emitToAll(eventName, message) {
		this.game.players.forEach(player => player.emit(eventName, message));
	}

	_saveMessage(eventName, message) {
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
					// If it's now this player's turn, clear messages from last turn before showing
					// player the "Execute Turn" button.
					this.savedMessages = [[eventName, message]];
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

module.exports = {
	PlayerRecord,
	Player
}