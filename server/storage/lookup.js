const Data = require("../storage/data.js");
const {Game, Lobby} = require("../models/game.js");
const MemStore = require("../storage/in-memory-store.js");

/**
 * Looking up means returning an in-memory representation that can be modified and may be enriched with values like
 * a Player holding a reference to its socket or Game.
 *
 * This is achieved by:
 *   1) reading from the "DB", enriching into an in-memory model, and caching the in-memory model.
 *   2) writing to the cached in-memory model, and periodically updating the "DB" from the cache.
 *   3) deleting the object from both the cache and "DB" immediately, so the "DB" isn't used to remind the cache.
 */

function fetchGame(gameId) {
	if (gameId in MemStore.games) {
		// Fetch from cache.
		return MemStore.games[gameId];
	}

	if (gameId in Data.games) {
		// Fetch from DB, enrich to a modifiable version, then cache.
		const gameRecord = Data.games[gameId];
		const game = new Game(gameRecord);
		MemStore.games[gameId] = game;
		return game;
	}

	return undefined;
}

function fetchLobby(lobbyId) {
	if (lobbyId in MemStore.lobbies) {
		// Fetch from cache.
		return MemStore.lobbies[lobbyId];
	}

	if (lobbyId in Data.lobbies) {
		// Fetch from DB, enrich to a modifiable version, then cache.
		const lobbyRecord = Data.lobbies[lobbyId];
		const lobby = new Lobby(lobbyRecord);
		MemStore.lobbies[lobbyId] = lobby;
		return lobby;
	}

	return undefined;
}

function createLobby(lobby) {
	// Write just to cache.
	MemStore.lobbies[lobby.id] = lobby;
}

function convertLobbyToGame(game) {
	const gameId = game.id;
	const userIds = game.players.map(player => player.userId);

	// Remove lobby.
	delete Data.lobbies[gameId];
	delete MemStore.lobbies[gameId];

	// Create game.
	MemStore.games[gameId] = game;

	// Unlink users.
	userIds.forEach(userId => {
		MemStore.users[userId].lobbyIds.remove(gameId);
		MemStore.users[userId].gameIds.push(gameId);
	});
}

function deleteLobby(lobby) {
	const lobbyId = lobby.id;
	const userIds = Object.keys(lobby.memberMap);

	// Remove lobby.
	delete Data.lobbies[lobbyId];
	delete MemStore.lobbies[lobbyId];

	// Unlink users.
	userIds.forEach(userId => MemStore.users[userId].lobbyIds.remove(lobbyId));
}

function fetchUser(userId) {
	if (userId in MemStore.users) {
		// Fetch from cache.
		return MemStore.users[userId];
	}

	if (userId in Data.users) {
		// Fetch from DB, make a modifiable copy, then cache.
		const userRecord = Data.users[userId];
		const user = JSON.parse(JSON.stringify(userRecord));
		MemStore.users[userId] = user;
		return user;
	}

	return undefined;
}

function createUser(userId, user) {
	MemStore.users[userId] = user;
}

module.exports = {
	fetchGame,
	fetchLobby,
	createLobby,
	convertLobbyToGame,
	deleteLobby,
	fetchUser,
	createUser
};