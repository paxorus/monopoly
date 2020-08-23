const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cookieParser = require('cookie-parser')

const {onConnection} = require("./core/event-handlers.js");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

io.on("connection", socket => onConnection(io, socket));

let games = {};


app.get("/", function(req, res) {
	if ("playerId" in req.cookies) {
		// TODO: Fetch games
		const games = [];
		// TODO: Fetch player
		res.render("pages/landing", {games});
	} else {
		res.cookie("playerId", randomId(), {httpOnly: true});
		res.render("pages/landing", {games: []});
	}
});

app.get("/game/create/:gameName", function(req, res) {
	const {gameName} = req.params;
	const {playerId} = req.cookies;
	const gameId = randomId();
	const newGame = {
		name: gameName,
		adminId: playerId,
		createTime: +new Date()
	};
	// TODO: blocking game registration
	games[gameId] = newGame;
	res.redirect(`/lobby/${gameId}`);
});

app.get("/lobby/:gameId", function(req, res) {
	const {gameId} = req.params;

	const game = games[gameId];
	if (!game) {
		res.render("pages/404", {
			message: `Game ${gameId} not found.`
		});
	}

	const {playerId} = req.cookies;
	res.render("pages/lobby", {
		adminId: game.adminId,
		gameName: game.name,
		gameCreateTime: game.createTime
	});
});

app.get("/game/play/:gameId/:secretKey", function(req, res) {
	const {gameId, secretKey} = req.params;
	// TODO: Fetch game state
	res.render("pages/gameplay", {gameId, secretKey});
});

// app.post("/game/create", function(req, res) {
// 	const {userId} = req.params;
// 	const gameId = Math.random();
// 	games[gameId] = null;
// 	res.render("pages/lobby", {admin: userId, gameId});
// });

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