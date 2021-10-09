const Lookup = require("../storage/lookup.js");
const {Game, GameRecord} = require("../models/game.js");


function onLobbyConnection(lobbyIo, socket, userId) {
	let _lobbyId;

	socket.on("open-lobby", ({lobbyId}) => {
		_lobbyId = lobbyId;
		socket.join(`lobby-${lobbyId}`);
		console.log(`${userId} opened lobby ${lobbyId}`);
	});

	socket.on("join-lobby", ({name, sprite}) => {
		const lobby = Lookup.fetchLobby(_lobbyId);
		if (userId in lobby.memberMap) {
			return;
		}

		// Player names and images are hard-coded for now.
		lobby.addMember(userId, name, sprite);
		lobbyIo.to(`lobby-${_lobbyId}`).emit("join-lobby", {userId, name, sprite});
		Lookup.fetchUser(userId).lobbyIds.push(_lobbyId);
		console.log(`${userId} joined lobby ${_lobbyId}`);
	});

	socket.on("leave-lobby", () => {
		const lobby = Lookup.fetchLobby(_lobbyId);

		lobbyIo.to(`lobby-${_lobbyId}`).emit("leave-lobby", {userId});
		delete lobby.memberMap[userId];
		Lookup.fetchUser(userId).lobbyIds.remove(_lobbyId);
		console.log(`${userId} left lobby ${_lobbyId}`);
	});

	// When admin starts the game from the lobby.
	socket.on("convert-to-game", () => {

		const lobby = Lookup.fetchLobby(_lobbyId);

		if (lobby.adminId !== userId) {
			res.status(401);
			res.send("401 (Unauthorized): You are not the admin of this game");
			return;
		}

		const game = new Game(GameRecord.prototype.buildFromLobby(lobby));
		Lookup.convertLobbyToGame(game);

		// Cause everyone in the lobby to reload the page.
		lobbyIo.to(`lobby-${_lobbyId}`).emit("start-game");
	});

	socket.on("disband-lobby", () => {
		const lobby = Lookup.fetchLobby(_lobbyId);

		if (lobby.adminId !== userId) {
			res.status(401);
			res.send("401 (Unauthorized): You are not the admin of this game");
			return;
		}

		Lookup.deleteLobby(lobby);

		// Force all users in the lobby to load the main page.
		lobbyIo.to(`lobby-${_lobbyId}`).emit("return-to-landing-page", {cookieKey: "landingToast", cookieValue: {
			eventName: "toast:lobby-disbanded",
			lobbyName: lobby.name,
			adminId: lobby.adminId
		}});
	});

	socket.on("disconnect", () => {
		console.log(`${userId} closed lobby ${_lobbyId}`);
	});
}

module.exports = {
	onLobbyConnection
};