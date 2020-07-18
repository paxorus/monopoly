const Player = require("./player.js");

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

const players = [
  new Player("Prakhar", 0, LEGENDARY_MODE ? Sprite.KYOGRE_PRIMAL : Sprite.SWAMPERT_MEGA),
  new Player("Jerry", 1, LEGENDARY_MODE ? Sprite.GROUDON_PRIMAL : Sprite.BLAZIKEN_MEGA)
  // new Player("Kanav", 2, LEGENDARY_MODE ? Sprite.RAYQUAZA_MEGA : Sprite.SCEPTILE_MEGA),
  // new Player("Ashwin", 3, LEGENDARY_MODE ? Sprite.DIALGA : Sprite.CHARIZARD_MEGA_Y),
  // new Player("Michael", 4, LEGENDARY_MODE ? Sprite.ZEKROM : Sprite.SALAMENCE_MEGA)
];

// To serve the right experience to the right user.
const authLookup = {
	"prakhar": players[0],
	"jerry": players[1]
};

// TODO: Game state should be isolated into rooms.
const GlobalState = {
	currentPlayer: undefined,
	tax: 0,
	hasGameStarted: false
};

module.exports = {
	GlobalState,
	players,
	authLookup
};