let players;

const currentLogs = {};

function createPlayerMessageBoxes(_players) {
	players = _players;

	_players.forEach(player => {
		currentLogs[player.num] = [];
	});
}

function all(eventName, message) {
	players.forEach(player => player.emit(eventName, message));
}

function saveMessageForPlayer(playerId, eventName, message) {
	// Save messages of a player's most recent turn, to re-serve them on a page load.
	switch (eventName) {
		case "allow-conclude-turn":
		case "offer-pay-out-of-jail":
		case "offer-unowned-property":
		case "log":
			currentLogs[playerId].push([eventName, message]);
			break;

		case "advance-turn":
			if (playerId === message.nextPlayerId) {
				// Clear messages when going to show player the "Execute Turn" button.
				currentLogs[playerId] = [];
			} else {
				currentLogs[playerId].push([eventName, message]);
			}
			break;
	}
}

function getMessagesForPlayer(playerId) {
	return currentLogs[playerId];
}

module.exports = {
	createPlayerMessageBoxes,
	emit: {
		all,
		saveMessageForPlayer
	},
	getMessagesForPlayer
};