import {places, Locations} from "./location-configs.js";
import {slide, toggleHighlightedProperties, JAIL_VERTICAL_WALKWAY_CAPACITY} from "./game-board.js";

export default class Player {
	constructor(name, num, spriteFileName) {
		this.name = name;
		this.num = num;
		this.spriteFileName = spriteFileName;

		this.balance = 1500;
		this.placeIdx = Locations.Go;
		this.jailDays = 0;
		this.latestRoll = null;
		this.rollCount = 0;
		this.numJailCards = 0;
	}

	collectGoMoney() {
		mover.updateBalance(200);
		mover.log("Collected $200 for passing Go.");
	}

	updateJailDays(jailDays) {
		this.jailDays = jailDays;
	}

	goToJail() {
		this.jailDays = 3;
		$("#loc" + this.num).text("Jail");
		$(`#jail-card${this.num} > .use-jail-card`).toggleClass("button-disabled", false);
		$("#jail").append($("#marker" + this.num));
	}

	getOutOfJail() {
		this.jailDays = 0;
		$("#loc" + this.num).text("Just Visiting");
		this.moveToJustVisiting();
		$(`#jail-card${this.num} > .use-jail-card`).toggleClass("button-disabled", true);
	}

	updateBalance(newBalance) {
		// Update the view with the player's balance.
		this.balance = newBalance;
		$("#bal" + this.num).text("$" + this.balance);
	}

	updateLocation(newLocation) {
		const oldLocation = this.placeIdx;
		this.placeIdx = newLocation;
		$("#board").children().eq(this.placeIdx).append($("#marker" + this.num));

		// Update the view with the current user's location.
		$("#loc" + this.num).text(places[this.placeIdx].name);
		if (places[this.placeIdx].housePrice) {
			// Place on property walkway.
			$("#board").children().eq(this.placeIdx).children().first().append($("#marker" + this.num));
		} else if (this.placeIdx === Locations.Jail) {
			this.moveToJustVisiting();
		} else {
			$("#board").children().eq(this.placeIdx).append($("#marker" + this.num));
		}

		if (oldLocation === Locations.Jail) {
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

	buildSprite() {
		const circ = document.createElement("img");
		circ.id = "marker" + this.num;
		circ.className = "circ";
		circ.src = this.spriteFileName;
		circ.addEventListener("click", event => {
			slide(this.num);
			event.stopPropagation();
		});
		circ.addEventListener("mouseover", event => {
			toggleHighlightedProperties(this.num, true);
		});
		circ.addEventListener("mouseout", event => {
			toggleHighlightedProperties(this.num, false);
		});

		return circ;
	}
}
