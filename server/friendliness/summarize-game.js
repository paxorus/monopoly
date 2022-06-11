function summarizeGame(game, yourId) {
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
		gameCreateTime: game.createTime,
		gameLastUpdateTime: game.lastUpdateTime,
		numTurns: game.numTurns,
		numOwnedProperties,
		playerData,
		creatorName,
		yourName,
		waitingOnName
	};
}

function summarizeLobby(lobby, yourId) {
	const playerNames = Object.values(lobby.memberMap).map(lobbyMember => lobbyMember.name);
	const adminName = lobby.memberMap[lobby.adminId].name;

	return {
		id: lobby.id,
		name: lobby.name,
		gameCreateTime: lobby.createTime,
		adminName,
		adminId: lobby.adminId,
		playerNames
	};
}

module.exports = {
	summarizeGame,
	summarizeLobby
};