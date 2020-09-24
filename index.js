const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cookie = require("cookie");
const cookieParser = require("cookie-parser");

const {onConnection} = require("./core/event-handlers.js");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Monkey patch
Array.prototype.remove = function (x) {
	const idx = this.findIndex(y => y === x);
	if (idx !== -1) {
		this.splice(idx, 1);
	}
};

io.of("/gameplay").on("connection", socket => {
	const {playerId, secretKey} = cookie.parse(socket.request.headers.cookie);

	// Authenticate and identify socket on connection.
	if (!socketAuthenticatePlayer(socket, playerId, secretKey)) {
		return;
	}

	onConnection(io, socket);
});

let games = {
	"oiwftflpzyhsxjgarpla": {
		id: "oiwftflpzyhsxjgarpla",
		name: "my game",
		adminId: "heerffgylfgxuslpsujz",
		createTime: 1598213805058,
		hasStarted: false,
		hasCompleted: false,
		playerIds: []
	}
};

let players = {
	"heerffgylfgxuslpsujz": {
		secretKey: "icmufmqrjuybromognhx",
		gameIds: ["oiwftflpzyhsxjgarpla"]
	}
};

app.get("/", function(req, res) {
	if ("playerId" in req.cookies) {
		const {playerId, secretKey} = req.cookies;
		if (!httpAuthenticatePlayer(res, playerId, secretKey)) {
			return;
		}

		const player = players[playerId];

		// TODO: have page ajax-get the below info after page load
		const playerGames = player.gameIds.map(gameId => games[gameId]);
		const inProgressGames = playerGames.filter(game => ! game.hasCompleted);
		const completedGames = playerGames.filter(game => game.hasCompleted);
		res.render("pages/landing", {
			inProgressGames,
			completedGames,
			yourId: playerId
		});
	} else {
		// New player.
		const playerId = setNewPlayerAndCookies(res);
		res.render("pages/landing", {
			inProgressGames: [],
			completedGames: [],
			yourId: playerId
		});
	}
});

app.get("/action/create-game/:gameName", function(req, res) {
	const {gameName} = req.params;
	const {playerId} = req.cookies;
	const gameId = randomId();
	const newGame = {
		id: gameId,
		name: gameName,
		adminId: playerId,
		createTime: +new Date(),
		hasStarted: false,
		hasCompleted: false,
		playerIds: []
	};
	// TODO: blocking game registration
	games[gameId] = newGame;
	players[playerId].gameIds.push(gameId);

	res.redirect(`/game/${gameId}`);
});

app.get("/game/:gameId", function(req, res) {
	const {gameId} = req.params;

	const game = games[gameId];
	if (!game) {
		res.render("pages/404", {
			message: `Game ${gameId} not found.`
		});
		return;
	}

	let {playerId, secretKey} = req.cookies;

	if (playerId === undefined) {// New visitor.
		playerId = setNewPlayerAndCookies(res);
	} else if (!httpAuthenticatePlayer(res, playerId, secretKey)) {
		return;
	}

	// TODO: Show game if complete.
	if (game.hasStarted) {
		// Render game.
		res.render("pages/gameplay", {gameId, secretKey});
	} else {
		// Render lobby.
		// const {playerId} = req.cookies;
		res.render("pages/lobby", {
			adminId: game.adminId,
			gameName: game.name,
			gameCreateTime: game.createTime,
			gameId: game.id,
			yourId: playerId,
			joinedPlayerNames: game.playerIds.map(playerId => playerId),
			hasJoinedGame: game.playerIds.includes(playerId)
		});
	}
});

function setNewPlayerAndCookies(res) {
	const playerId = randomId();
	const secretKey = randomId();

	res.cookie("playerId", playerId, {httpOnly: true});
	res.cookie("secretKey", secretKey, {httpOnly: true});

	players[playerId] = {
		gameIds: [],
		secretKey
	};

	return playerId;
}

// app.get("/game/play/:gameId/:secretKey", function(req, res) {
// 	const {gameId, secretKey} = req.params;
// 	// TODO: Fetch game state
// 	res.render("pages/gameplay", {gameId, secretKey});
// });

// app.post("/game/create", function(req, res) {
// 	const {userId} = req.params;
// 	const gameId = Math.random();
// 	games[gameId] = null;
// 	res.render("pages/lobby", {admin: userId, gameId});
// });

io.of("/lobby").on("connection", socket => {

	const {playerId, secretKey} = cookie.parse(socket.request.headers.cookie);

	// Authenticate and identify socket on connection.
	if (!socketAuthenticatePlayer(socket, playerId, secretKey)) {
		return;
	}

	// const player = players[playerId];// Needed?

	let _gameId;

	socket.on("join-lobby", ({gameId}) => {
		_gameId = gameId;
		socket.join(`lobby-${gameId}`);
		console.log(`${playerId} joined lobby ${_gameId}`);
	});

	socket.on("join-game", () => {
		const game = games[_gameId];
		if (game.playerIds.includes(playerId)) {
			return;
		}

		if (game.hasStarted) {
			return;
		}

		socket.to(`lobby-${_gameId}`).emit("join-game", {playerId});
		games[_gameId].playerIds.push(playerId);
		players[playerId].gameIds.push(_gameId);
		console.log(`${playerId} joined game ${_gameId}`);
	});

	socket.on("leave-game", () => {
		const game = games[_gameId];
		if (game.hasStarted) {
			return;
		}

		socket.to(`lobby-${_gameId}`).emit("leave-game", {playerId});
		games[_gameId].playerIds.remove(playerId);
		players[playerId].gameIds.remove(_gameId);
		console.log(`${playerId} left game ${_gameId}`);
	});

	socket.on("start-game", () => {
		const game = games[_gameId];

		if (game.adminId !== playerId) {
			res.status(401);
			res.send("401 (Unauthorized): You are not the admin of this game");
			return;
		}

		game.hasStarted = true;
		io.of("/lobby").to(`lobby-${_gameId}`).emit("start-game");
	});

	socket.on("disconnect", () => {
		console.log(`${playerId} left lobby ${_gameId}`);
	});
});

function httpAuthenticatePlayer(res, playerId, secretKey) {
	const player = players[playerId];

	if (player === undefined) {
		res.status(401);
		res.send("401 (Unauthorized): Player not recognized");
		return false;
	}

	if (player.secretKey !== secretKey) {
		res.status(401);
		res.send("401 (Unauthorized): Player recognized but does not match device");
		return false;
	}

	return true;
}

function socketAuthenticatePlayer(socket, playerId, secretKey) {
	if (!(playerId in players)) {
		// Invalid player ID or secret key.
		socket.emit("bad-player-id");
		return false;
	}

	if (players[playerId].secretKey !== secretKey) {
		// Invalid player ID or secret key.
		socket.emit("bad-secret-key");
		return false;
	}

	return true;
}

// To run client-side tests.
app.get("/test", function(req, res) {
	res.render("pages/test");
});

app.use(function(req, res) {
	res.status(404);
	res.render("pages/404", {message: "Page not found."});
});

server.listen(app.get("port"), function() {
	console.log("Node app is running on port", app.get("port"));
});

function randomId() {
	// 26^20 possibilities = 94 bits
	let id = "";
	for (let i = 0; i < 20; i ++) {
		const charCode = Math.floor(Math.random() * 26) + 97;
		id += String.fromCharCode(charCode);
	}

	return id;
}