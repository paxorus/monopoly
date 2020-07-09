import {places} from "./location-configs.js";
import {log} from "./message-box.js";
import {JAIL_VERTICAL_WALKWAY_CAPACITY} from "./startup.js";

export default class Player {
    constructor(name, num, spriteFileName) {
        this.name = name;
        this.num = num;
        this.spriteFileName = spriteFileName;

        this.balance = 1500;
        this.locnum = 0;// placeIdx
        this.jailDays = 0;
        this.latestRoll = null;
        this.rollCount = 0;
        this.numJailCards = 0;
    }

    goToJail() {
        log("You will be in jail for 3 turns!");
        this.updateLocation(10);
        this.jailDays = 3;
        $("#loc" + this.num).text("Jail");
        $(`#jail-card${this.num} > .use-jail-card`).toggleClass("button-disabled", false);
        $("#jail").append($("#marker" + this.num));
    }

    getOutOfJail() {
        log("You are now out of jail!");
        this.jailDays = 0;
        $("#loc" + this.num).text("Just Visiting");
        this.moveToJustVisiting();
        $(`#jail-card${this.num} > .use-jail-card`).toggleClass("button-disabled", true);
    }

    updateBalance(income) {
        // Update the view with the player's balance.
        this.balance += income;
        $("#bal" + this.num).text("$" + this.balance);
    }

    updateLocation(newLocation) {
        const oldLocation = this.locnum;
        this.locnum = newLocation;

        // Update the view with the current user's location.
        $("#loc" + this.num).text(places[this.locnum].name);
        if (places[this.locnum].ho) {
            $("#board").children().eq(this.locnum).children().first().append($("#marker" + this.num));
        } else if (this.locnum === 10) {
            this.moveToJustVisiting();
        } else {
            $("#board").children().eq(this.locnum).append($("#marker" + this.num));
        }

        if (oldLocation === 10) {
            // Left Just Visiting, re-shuffle any other players onto vertical walkway.
            const newOccupancy = $("#jail-vertical-walkway").children().length;
            const newAvailability = JAIL_VERTICAL_WALKWAY_CAPACITY - newOccupancy;
            $("#jail-horizontal-walkway").children().slice(0, newAvailability).each((i, playerSprite) => {
                $("#jail-vertical-walkway").append(playerSprite);
            });            
        }
    }

    moveToJustVisiting() {
        if ($("#jail-vertical-walkway").children().length < JAIL_VERTICAL_WALKWAY_CAPACITY) {
            $("#jail-vertical-walkway").append($("#marker" + this.num));
        } else {
            $("#jail-horizontal-walkway").append($("#marker" + this.num));
        }
    }
}
