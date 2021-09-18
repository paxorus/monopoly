const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cookie = require("cookie");
const cookieParser = require("cookie-parser");

const Data = require("./core/data.js");
const MemStore = require("./core/in-memory-store.js");
const {onConnection} = require("./core/event-handlers.js");
const {PlayerIcons, PlayerRecord} = require("./core/player.js");
const describeTimeSince = require("./core/age-to-text-helper.js")

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Monkey patch
Array.prototype.remove = function (x) {
	const idx = this.findIndex(y => y === x);
	if (idx !== -1) {
		this.splice(idx, 1);
	}
};

io.of("/gameplay").on("connection", socket => {
	const {userId, secretKey} = cookie.parse(socket.request.headers.cookie);

	// Authenticate and identify socket on connection.
	if (!socketAuthenticatePlayer(socket, userId, secretKey)) {
		return;
	}

	onConnection(io.of("/gameplay"), socket, userId);
});

app.get("/", function(req, res) {
	if ("userId" in req.cookies) {
		const {userId, secretKey} = req.cookies;
		if (!httpAuthenticatePlayer(res, userId, secretKey)) {
			return;
		}

		const user = Data.users[userId];

		// TODO: have page ajax-get the below info after page load
		const userGames = user.gameIds.map(gameId => Data.games[gameId]);
		const inProgressGames = userGames.filter(game => ! game.hasCompleted).map(game => summarizeGame(game, userId));
		const completedGames = userGames.filter(game => game.hasCompleted).map(game => summarizeGame(game, userId));
		res.render("pages/landing", {
			inProgressGames,
			completedGames,
			yourId: userId,
			playerIcons: PlayerIcons
		});
	} else {
		// New user.
		const userId = setNewPlayerAndCookies(res);
		res.render("pages/landing", {
			inProgressGames: [],
			completedGames: [],
			yourId: userId,
			playerIcons: PlayerIcons
		});
	}
});

app.post("/action/create-game", function(req, res) {
	const {gameName, adminDisplayName, adminSpriteSrc} = req.body;

	const {userId} = req.cookies;
	const gameId = randomId();
	const newGame = {
		id: gameId,
		name: gameName,
		adminId: userId,
		createTime: +new Date(),
		hasStarted: false,
		hasCompleted: false,
		lobby: {
			// Admin is always in the lobby. They cannot leave it, only disband.
			[userId]: {name: adminDisplayName, sprite: adminSpriteSrc}
		}
	};
	// TODO: blocking game registration
	Data.games[gameId] = newGame;
	Data.users[userId].gameIds.push(gameId);

	res.send({
		newGameId: gameId
	});
});

app.get("/game/:gameId", function(req, res) {
	const {gameId} = req.params;

	const game = Data.games[gameId];
	if (!game) {
		res.render("pages/404", {
			message: `Game ${gameId} not found.`
		});
		return;
	}

	let {userId, secretKey} = req.cookies;

	if (userId === undefined) {// New visitor.
		userId = setNewPlayerAndCookies(res);
	} else if (!httpAuthenticatePlayer(res, userId, secretKey)) {
		return;
	}

	// TODO: Show game if complete.
	if (game.hasStarted) {
		// Render game.
		res.render("pages/gameplay", {gameId});
	} else {
		// Render lobby.
		// const {userId} = req.cookies;
		res.render("pages/lobby", {
			adminId: game.adminId,
			gameName: game.name,
			gameCreateTime: game.createTime,
			gameId: game.id,
			yourId: userId,
			joinedPlayerNames: Object.values(game.lobby).map(lobbyMember => lobbyMember.name),
			hasJoinedGame: Object.keys(game.lobby).includes(userId)
		});
	}
});

function setNewPlayerAndCookies(res) {
	const userId = randomId();
	const secretKey = randomId();

	res.cookie("userId", userId, {httpOnly: true});
	res.cookie("secretKey", secretKey, {httpOnly: true});

	Data.users[userId] = {
		gameIds: [],
		secretKey
	};

	return userId;
}

io.of("/lobby").on("connection", socket => {

	const {userId, secretKey} = cookie.parse(socket.request.headers.cookie);

	// Authenticate and identify socket on connection.
	if (!socketAuthenticatePlayer(socket, userId, secretKey)) {
		return;
	}

	// const player = players[userId];// Needed?

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

		const gameRecord = new GameRecord(lobbyRecord);

		// Build in-memory structures from records.
		MemStore.games[_gameId] = new Game(gameRecord);

		// Persist game record, overwriting lobby record.
		Data.games[_gameId] = gameRecord;

		// Cause everyone in the lobby to reload the page.
		io.of("/lobby").to(`lobby-${_gameId}`).emit("start-game");
	});

	socket.on("disconnect", () => {
		console.log(`${userId} left lobby ${_gameId}`);
	});
});

function httpAuthenticatePlayer(res, userId, secretKey) {
	const player = Data.users[userId];

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

function socketAuthenticatePlayer(socket, userId, secretKey) {
	if (!(userId in Data.users)) {
		// Invalid player ID or secret key.
		socket.emit("bad-player-id");
		return false;
	}

	if (Data.users[userId].secretKey !== secretKey) {
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
