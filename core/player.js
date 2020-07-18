const {places, Locations} = require("./location-configs.js");
const {emit} = require("./message-box.js");

module.exports = class Player {
    constructor(name, num, spriteFileName) {
        this.name = name;
        this.num = num;
        this.spriteFileName = spriteFileName;

        this.latestRoll = null;
        this.rollCount = 0;// Needed?
        this.balance = 1500;
        this.placeIdx = Locations.Go;
        
        this.jailDays = 0;
        this.numJailCards = 0;

        this.socket = null;
    }

    decrementJailDays(jailDays) {
        this.jailDays --;
        emit.all("update-jail-days", {playerId: this.num, jailDays: this.jailDays});
    }

    goToJail() {
        this.log("You will be in jail for 3 turns!");
        this.updateLocation(Locations.Jail);
        this.jailDays = 3;
        emit.all("go-to-jail", {playerId: this.num});
    }

    getOutOfJail() {
        this.log("You are now out of jail!");
        this.jailDays = 0;
        emit.all("get-out-of-jail", {playerId: this.num});
    }

    updateBalance(income) {
        this.balance += income;
        emit.all("update-balance", {playerId: this.num, balance: this.balance});
    }

    updateLocation(newLocation) {
        this.placeIdx = newLocation;
        emit.all("update-location", {playerId: this.num, placeIdx: this.placeIdx});
    }

    configureEmitter(socket) {
        this.socket = socket;
    }

    emit(eventName, message) {
        this.socket.emit(eventName, message);
    }

    log(message) {
        this.emit("log", message);
    }
}
