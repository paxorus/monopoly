import {Locations} from "/javascripts/gameplay/location-configs.js";
import ImmutableModel from "/javascripts/gameplay/immutable-model.js";

export default class Player extends ImmutableModel {
	constructor(name, num, spriteFileName) {
		super();
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
