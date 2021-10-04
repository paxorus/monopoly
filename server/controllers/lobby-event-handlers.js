const Data = require("../storage/data.js");
const {Game, GameRecord} = require("../models/game.js");
const MemStore = require("../storage/in-memory-store.js");


function onLobbyConnection(lobbyIo, socket, userId) {
	let _lobbyId;

	socket.on("open-lobby", ({lobbyId}) => {
		_lobbyId = lobbyId;
		socket.join(`lobby-${lobbyId}`);
		console.log(`${userId} opened lobby ${lobbyId}`);
	});

	socket.on("join-lobby", () => {
		const lobby = Data.lobbies[_lobbyId];
		if (userId in lobby) {
			return;
		}

		socket.to(`lobby-${_lobbyId}`).emit("join-lobby", {userId});
		// Player images are hard-coded for now.
		Data.lobbies[_lobbyId].addMember(userId, userId, "/8/8a/483Dialga.png");
		Data.users[userId].lobbyIds.push(_lobbyId);
		console.log(`${userId} joined lobby ${_lobbyId}`);
	});

	socket.on("leave-lobby", () => {
		const lobby = Data.lobbies[_lobbyId];

		socket.to(`lobby-${_lobbyId}`).emit("leave-lobby", {userId});
		delete Data.lobbies[_lobbyId].lobby[userId];
		console.log(`${userId} left lobby ${_lobbyId}`);
	});

	// When admin starts the game from the lobby.
	socket.on("convert-to-game", () => {

		const lobbyRecord = Data.lobbies[_lobbyId];

		if (lobbyRecord.adminId !== userId) {
			res.status(401);
			res.send("401 (Unauthorized): You are not the admin of this game");
			return;
		}

		const gameRecord = GameRecord.prototype.buildFromLobby(lobbyRecord);

		delete Data.lobbies[_lobbyId];
		Data.users[userId].lobbyIds.remove(_lobbyId);
		Data.users[userId].gameIds.push(_lobbyId);

		// Build in-memory structures from records.
		MemStore.games[_lobbyId] = new Game(gameRecord);

		// Persist game record, overwriting lobby record.
		Data.games[_lobbyId] = gameRecord;

		// Cause everyone in the lobby to reload the page.
		lobbyIo.to(`lobby-${_lobbyId}`).emit("start-game");
	});

	socket.on("disconnect", () => {
		console.log(`${userId} closed lobby ${_lobbyId}`);
	});
}

module.exports = {
	onLobbyConnection
};