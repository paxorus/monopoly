const Data = require("./data.js");
const Player = require("./player.js");
const {places} = require("./location-configs.js");
const {createPlayerMessageBoxes, emit} = require("./message-box.js");

// Shared state
// Players are hard-coded for now.
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

// const players = [
// 	new Player("Prakhar", 0, LEGENDARY_MODE ? Sprite.KYOGRE_PRIMAL : Sprite.SWAMPERT_MEGA),
// 	new Player("Jerry", 1, LEGENDARY_MODE ? Sprite.GROUDON_PRIMAL : Sprite.BLAZIKEN_MEGA)
// 	// new Player("Kanav", 2, LEGENDARY_MODE ? Sprite.RAYQUAZA_MEGA : Sprite.SCEPTILE_MEGA),
// 	// new Player("Ashwin", 3, LEGENDARY_MODE ? Sprite.DIALGA : Sprite.CHARIZARD_MEGA_Y),
// 	// new Player("Michael", 4, LEGENDARY_MODE ? Sprite.ZEKROM : Sprite.SALAMENCE_MEGA)
// ];

// To serve the right experience to the right user.
// const authLookup = {
// 	"prakhar": players[0],
// 	"jerry": players[1]
// };

// TODO: Game state should be isolated into rooms.
// const GlobalState = {
// 	currentPlayer: undefined,
// 	tax: 0,
// 	addToTax: taxDelta => {
// 		this.tax += taxDelta;
// 		emit.all("update-tax", {tax: this.tax});
// 	},
// 	clearTax: () => {
// 		this.tax = 0;
// 		emit.all("update-tax", {tax: 0});
// 	},
// 	hasGameStarted: false
// };

// TODO
// createPlayerMessageBoxes(players);

function startGame(game) {
	// Build the player for each user.
	// TODO: Names and sprites should be customizable.
	// TODO: Does Player need the idx?
	const players = Object.entries(game.lobby).map(([userId, {name, sprite}], idx) => {
		return new Player(name, userId, idx, sprite, game);
	});

	// Choose starting player.
	const currentPlayerId = Math.floor(Math.random() * players.length);
	game.currentPlayer = players[currentPlayerId];

	game.players = players;
	game.hasStarted = true;

	game.tax = 0;
	game.monopolies = [];
	game.savedMessages = [];

	game.places = places.map((place, idx) => ({
		placeIdx: idx,
		ownerNum: -1,
		houseCount: 0,
		isMortgaged: false
	}));

	game.addToTax = taxDelta => {
		this.tax += taxDelta;
		emit.all("update-tax", {tax: this.tax});
	};
	game.clearTax = () => {
		this.tax = 0;
		emit.all("update-tax", {tax: 0});
	};
}

module.exports = {
	startGame
};