const {describeTimeSince} = require("./age-to-text-helper.js");


function summarizeGame(gameRecord, yourId) {
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
		timeSinceUpdated,
		numTurns: gameRecord.numTurns,
		numOwnedProperties,
		playerData,
		waitingOnName
	};
}

function summarizeLobby(lobbyRecord, yourId) {
	const timeSinceCreated = describeTimeSince(lobbyRecord.createTime);
	const playerNames = Object.values(lobbyRecord.memberMap).map(lobbyMember => lobbyMember.name);
	const adminName = lobbyRecord.memberMap[lobbyRecord.adminId].name;

	return {
		id: lobbyRecord.id,
		name: lobbyRecord.name,
		timeSinceCreated,
		adminName,
		adminId: lobbyRecord.adminId,
		playerNames
	};
}

module.exports = {
	summarizeGame,
	summarizeLobby
};