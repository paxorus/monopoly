const Data = require("./data.js");
const {PlayerRecord} = require("./player.js");
const {LocationInfo} = require("./location-configs.js");

// const Sprite = {
// 	SWAMPERT_MEGA: "/9/98/260Swampert-Mega.png",
// 	BLAZIKEN_MEGA: "/f/fa/257Blaziken-Mega.png",
// 	SCEPTILE_MEGA: "/6/67/254Sceptile-Mega.png",
// 	CHARIZARD_MEGA_Y: "/f/fd/006Charizard-Mega_Y.png",
// 	SALAMENCE_MEGA: "/f/f3/373Salamence-Mega.png",

// 	KYOGRE_PRIMAL: "/f/f1/382Kyogre-Primal.png",
// 	GROUDON_PRIMAL: "/9/9d/383Groudon-Primal.png",
// 	RAYQUAZA_MEGA: "/5/58/384Rayquaza-Mega.png",
// 	DIALGA: "/8/8a/483Dialga.png",
// 	ZEKROM: "/8/81/644Zekrom.png",
// }

const LEGENDARY_MODE = false;

/**
 * Build the game object from the lobby data, then mark the game as started, and have
 * the client reload the page.
 */
function startGame(game) {
	game.numTurns = 0;
	game.lastUpdateTime = null;

	// Build the player for each user.
	// TODO: Names and sprites should be customizable.
	const playerData = Object.entries(game.lobby).map(([userId, {name, sprite}], idx) => {
		return new PlayerRecord(name, userId, idx, sprite);
	});

	// Choose starting player at random.
	game.currentPlayerId = Math.floor(Math.random() * playerData.length);

	game.playerData = playerData;
	game.hasStarted = true;

	game.tax = 0;
	game.monopolies = [];

	game.locationData = LocationInfo.map(place =>
		place.price > 0 ? ({
			ownerNum: -1,
			houseCount: 0,
			isMortgaged: false,
			...place
		}) : place
	);
}

module.exports = {
	startGame
};