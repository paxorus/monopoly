import {buildAllViews, GlobalState} from "./game-board.js";
import Player from "./player.js";

function startUp({newPlayers, yourPlayerNum, startingPlayerNum}) {

	const players = newPlayers.map(player => new Player(player.name, player.num, player.spriteFileName));

	buildAllViews(players);

	GlobalState.me = players[yourPlayerNum];

	if (yourPlayerNum === startingPlayerNum) {
		$("#initial-interactive").css("display", "block");
	} else {
		$("#waiting-on-player").css("display", "block");
		$("#current-player-name").text(players[startingPlayerNum].name);
	}

	GlobalState.players = players;
}

export {
	startUp
};