const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const {
	advanceTurn,
	buyHouse,
	executeTurn,
	mortgageProperty,
	payOutOfJail,
	respondToBuyOffer,
	sellHouse,
	unmortgageProperty,
	useGetOutOfJailFreeCard
} = require("./core/execute-turn.js");
const {configureEmitter, emit} = require("./core/message-box.js");
const {authLookup, players, GlobalState} = require("./core/startup.js");

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

io.on("connection", socket => {
	console.log("a user connected");
	configureEmitter(io, socket);

	socket.on("disconnect", () => {
		console.log("a user disconnected");
	});

	socket.on("start-up", ({secretKey}) => {
		const player = authLookup[secretKey];
		player.configureEmitter(socket);

		const playerData = players.map(player => ({
			name: player.name,
			num: player.num,
			spriteFileName: player.spriteFileName
		}));

		if (GlobalState.hasGameStarted) {
			// For subsequent users, or users who refreshed the page.
			player.emit("start-up", {
				newPlayers: playerData,
				startingPlayerNum: GlobalState.currentPlayer.num,
				yourPlayerNum: player.num
			});
			return;
		}

		GlobalState.hasGameStarted = true;
		// Choose starting player.
		const startingPlayerNum = Math.floor(Math.random() * players.length);
	    GlobalState.currentPlayer = players[startingPlayerNum];

		io.emit("start-up", {
			newPlayers: playerData,
			startingPlayerNum,
			yourPlayerNum: player.num
		});
	});

	// Turn actions
	socket.on("advance-turn", () => {
		advanceTurn();
	});

	socket.on("execute-turn", ({playerId}) => {
		executeTurn(players[playerId]);
	});

	// Property actions
	socket.on("respond-to-buy-offer", ({playerId, ifBuy}) => {
		respondToBuyOffer(players[playerId], ifBuy);
	});

	socket.on("buy-house", ({playerId, placeIdx}) => {
		buyHouse(players[playerId], placeIdx);
	});

	socket.on("sell-house", ({playerId, placeIdx}) => {
		sellHouse(players[playerId], placeIdx);
	});

	// Jail actions
	socket.on("use-jail-card", ({playerId}) => {
		useGetOutOfJailFreeCard(players[playerId]);
	});

	socket.on("pay-out-of-jail", ({playerId}) => {
		payOutOfJail(players[playerId]);
	});

	// Mortgage rules
	socket.on("mortgage-property", ({playerId, placeIdx}) => {
		mortgageProperty(players[playerId], placeIdx);
	});

	socket.on("unmortgage-property", ({playerId, placeIdx}) => {
		unmortgageProperty(players[playerId], placeIdx);
	});
});

app.get("/index/:secretKey", function(req, res) {
	res.render("pages/index", {secretKey: req.params.secretKey});
});

// To run client-side tests.
app.get("/test", function(req, res) {
	res.render("pages/test");
});

server.listen(app.get("port"), function() {
	console.log("Node app is running on port", app.get("port"));
});