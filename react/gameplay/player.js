import {Locations} from "/javascripts/gameplay/location-configs.js";

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
}
