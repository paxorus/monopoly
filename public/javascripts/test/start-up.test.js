import {startUp} from "../start-up.js";

const newPlayers = [
	new Player("Boop", 0, "/0/0d/025Pikachu.png"),
	new Player("Boop", 1, "/0/0d/025Pikachu.png"),
	new Player("Boop", 2, "/0/0d/025Pikachu.png"),
	new Player("Boop", 3, "/0/0d/025Pikachu.png"),
	new Player("Boop", 4, "/0/0d/025Pikachu.png")
];

startUp({
	newPlayers,
	yourPlayerNum: 0,
	startingPlayerNum: 0
});