const Data = require("./data.js");
const Player = require("./player.js");
const {places} = require("./location-configs.js");

const Sprite = {
	SWAMPERT_MEGA: "/9/98/260Swampert-Mega.png",
	BLAZIKEN_MEGA: "/f/fa/257Blaziken-Mega.png",
	SCEPTILE_MEGA: "/6/67/254Sceptile-Mega.png",
	CHARIZARD_MEGA_Y: "/f/fd/006Charizard-Mega_Y.png",
	SALAMENCE_MEGA: "/f/f3/373Salamence-Mega.png",

	KYOGRE_PRIMAL: "/f/f1/382Kyogre-Primal.png",
	GROUDON_PRIMAL: "/9/9d/383Groudon-Primal.png",
	RAYQUAZA_MEGA: "/5/58/384Rayquaza-Mega.png",
	DIALGA: "/8/8a/483Dialga.png",
	ZEKROM: "/8/81/644Zekrom.png",
}

const LEGENDARY_MODE = false;

function startGame(game) {
	// Build the player for each user.
	// TODO: Names and sprites should be customizable.
	// TODO: Does Player need the idx?
	const players = Object.entries(game.lobby).map(([userId, {name, sprite}], idx) => {
		return new Player(name, userId, idx, sprite, game);
	});

	// Choose starting player.
	const currentPlayerId = Math.floor(Math.random() * players.length);
	game.currentPlayerId = currentPlayerId;

	game.players = players;
	game.hasStarted = true;

	game.tax = 0;
	game.monopolies = [];

	game.places = places.map((place, idx) => ({
		placeIdx: idx,
		ownerNum: -1,
		houseCount: 0,
		isMortgaged: false
	}));
}

module.exports = {
	startGame
};