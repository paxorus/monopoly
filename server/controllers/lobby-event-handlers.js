const Data = require("../storage/data.js");
const {Game, GameRecord} = require("../models/game.js");
const MemStore = require("../storage/in-memory-store.js");


function onLobbyConnection(lobbyIo, socket, userId) {
	let _gameId;

	socket.on("open-lobby", ({gameId}) => {
		_gameId = gameId;
		socket.join(`lobby-${gameId}`);
		console.log(`${userId} opened lobby ${_gameId}`);
	});

	socket.on("join-lobby", () => {
		const game = Data.games[_gameId];
		if (Object.keys(game.lobby).includes(userId)) {
			return;
		}

		if (game.hasStarted) {
			return;
		}

		socket.to(`lobby-${_gameId}`).emit("join-lobby", {userId});
		// Player images are hard-coded for now.
		Data.games[_gameId].lobby[userId] = {name: userId, sprite: "/8/8a/483Dialga.png"};
		Data.users[userId].gameIds.push(_gameId);
		console.log(`${userId} joined lobby ${_gameId}`);
	});

	socket.on("leave-lobby", () => {
		const game = Data.games[_gameId];
		if (game.hasStarted) {
			return;
		}

		socket.to(`lobby-${_gameId}`).emit("leave-lobby", {userId});
		delete Data.games[_gameId].lobby[userId];
		console.log(`${userId} left lobby ${_gameId}`);
	});

	// When admin starts the game from the lobby.
	socket.on("start-game", () => {

		const lobbyRecord = Data.games[_gameId];

		if (lobbyRecord.adminId !== userId) {
			res.status(401);
			res.send("401 (Unauthorized): You are not the admin of this game");
			return;
		}

		const gameRecord = GameRecord.prototype.buildFromLobby(lobbyRecord);

		// Build in-memory structures from records.
		MemStore.games[_gameId] = new Game(gameRecord);

		// Persist game record, overwriting lobby record.
		Data.games[_gameId] = gameRecord;

		// Cause everyone in the lobby to reload the page.
		lobbyIo.to(`lobby-${_gameId}`).emit("start-game");
	});

	socket.on("disconnect", () => {
		console.log(`${userId} closed lobby ${_gameId}`);
	});
}

module.exports = {
	onLobbyConnection
};