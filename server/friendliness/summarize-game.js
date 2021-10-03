const {describeTimeSince} = require("./age-to-text-helper.js");


function summarizeGame(gameRecord, yourId) {
	return (gameRecord.hasStarted) ? summarizeGamePlay(gameRecord, yourId) : summarizeLobby(gameRecord, yourId);
}

function summarizeGamePlay(gameRecord, yourId) {
	const timeSinceCreated = describeTimeSince(gameRecord.createTime);
	const timeSinceUpdated = gameRecord.lastUpdateTime ? describeTimeSince(gameRecord.lastUpdateTime) : "never";

	const numOwnedProperties = gameRecord.placeRecords.filter(place => place.ownerNum !== -1).length;

	const creatorName = gameRecord.playerData.find(player => player.userId === gameRecord.adminId).name;

	const yourName = gameRecord.playerData.find(player => player.userId === yourId).name;
	const waitingOnName = gameRecord.playerData[gameRecord.currentPlayerId].name;

	// TODO: Compute net worth by liquidating houses, properties, and GOOJF cards.
	const playerData = gameRecord.playerData.map(player => ({
		name: player.name,
		netWorth: player.balance
	}));

	return {
		id: gameRecord.id,
		name: gameRecord.name,
		timeSinceCreated,
		creatorName,
		yourName,
		hasStarted: true,
		timeSinceUpdated,
		numTurns: gameRecord.numTurns,
		numOwnedProperties,
		playerData,
		waitingOnName
	};
}

function summarizeLobby(gameRecord, yourId) {
	const timeSinceCreated = describeTimeSince(gameRecord.createTime);
	const playerNames = Object.values(gameRecord.lobby).map(lobbyMember => lobbyMember.name);
	const creatorName = gameRecord.lobby[gameRecord.adminId].name;
	const yourName = gameRecord.lobby[yourId].name;

	return {
		id: gameRecord.id,
		name: gameRecord.name,
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