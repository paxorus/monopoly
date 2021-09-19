const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cookie = require("cookie");
const cookieParser = require("cookie-parser");

const {onGameplayConnection} = require("./server/controllers/gameplay-event-handlers.js");
const {onLobbyConnection} = require("./server/controllers/lobby-event-handlers.js");
const {socketAuthenticatePlayer} = require("./server/auth.js");
const {getLandingPage, getGameplayOrLobbyPage} = require("./server/controllers/get-page.js");
const {createGameLobby} = require("./server/controllers/admin-actions.js");

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
	const idx = this.indexOf(x);
	if (idx !== -1) {
		this.splice(idx, 1);
	}
};

// GET pages
app.get("/", getLandingPage);
app.get("/game/:gameId", getGameplayOrLobbyPage);

// POST actions
app.post("/action/create-game", createGameLobby);

// SocketIO connections
io.of("/lobby").on("connection", socket => {

	const {userId, secretKey} = cookie.parse(socket.request.headers.cookie);

	// Authenticate and identify socket on connection.
	if (!socketAuthenticatePlayer(socket, userId, secretKey)) {
		return;
	}

	onLobbyConnection(io.of("/lobby"), socket, userId);
});

io.of("/gameplay").on("connection", socket => {
	const {userId, secretKey} = cookie.parse(socket.request.headers.cookie);

	// Authenticate and identify socket on connection.
	if (!socketAuthenticatePlayer(socket, userId, secretKey)) {
		return;
	}

	onGameplayConnection(io.of("/gameplay"), socket, userId);
});

// Page for running client-side tests in browser.
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
