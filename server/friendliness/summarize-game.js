const {describeTimeSince} = require("./age-to-text-helper.js");


function summarizeGame(game, yourId) {
	const timeSinceCreated = describeTimeSince(game.createTime);
	const timeSinceUpdated = game.lastUpdateTime ? describeTimeSince(game.lastUpdateTime) : "never";

	const numOwnedProperties = game.places.filter(place => place.ownerNum !== undefined).length;

	const creatorName = game.players.find(player => player.userId === game.adminId).name;

	const yourName = game.players.find(player => player.userId === yourId).name;
	const waitingOnName = game.players[game.currentPlayerId].name;

	// TODO: Compute net worth by liquidating houses, properties, and GOOJF cards.
	const playerData = game.players.map(player => ({
		name: player.name,
		netWorth: player.balance
	}));

	return {
		id: game.id,
		name: game.name,
		timeSinceCreated,
		creatorName,
		yourName,
		timeSinceUpdated,
		numTurns: game.numTurns,
		numOwnedProperties,
		playerData,
		waitingOnName
	};
}

function summarizeLobby(lobby, yourId) {
	const timeSinceCreated = describeTimeSince(lobby.createTime);
	const playerNames = Object.values(lobby.memberMap).map(lobbyMember => lobbyMember.name);
	const adminName = lobby.memberMap[lobby.adminId].name;

	return {
		id: lobby.id,
		name: lobby.name,
		timeSinceCreated,
		adminName,
		adminId: lobby.adminId,
		playerNames
	};
}

module.exports = {
	summarizeGame,
	summarizeLobby
};