const {describeTimeSince} = require("./age-to-text-helper.js");


function summarizeGame(game, yourId) {
	return (game.hasStarted) ? summarizeGamePlay(game, yourId) : summarizeLobby(game, yourId);
}

function summarizeGamePlay(game, yourId) {
	const timeSinceCreated = describeTimeSince(game.createTime);
	const timeSinceUpdated = game.lastUpdateTime ? describeTimeSince(game.lastUpdateTime) : "never";

	const numOwnedProperties = game.locationData.filter(place => place.ownerNum !== -1).length;

	const creatorName = game.playerData.find(player => player.userId === game.adminId).name;

	const yourName = game.playerData.find(player => player.userId === yourId).name;
	const waitingOnName = game.playerData[game.currentPlayerId].name;

	const playerData = game.playerData.map(player => ({
		name: player.name,
		netWorth: player.balance
	}));

	return {
		id: game.id,
		name: game.name,
		timeSinceCreated,
		creatorName,
		yourName,
		hasStarted: true,
		timeSinceUpdated,
		numTurns: game.numTurns,
		numOwnedProperties,
		playerData,
		waitingOnName
	};
}

function summarizeLobby(game, yourId) {
	const timeSinceCreated = describeTimeSince(game.createTime);
	const playerNames = Object.values(game.lobby).map(lobbyMember => lobbyMember.name);
	const creatorName = game.lobby[game.adminId].name;
	const yourName = game.lobby[yourId].name;

	return {
		id: game.id,
		name: game.name,
		timeSinceCreated,
		creatorName,
		yourName,
		hasStarted: false,
		playerNames
	};
}

module.exports = {
	summarizeGame
};