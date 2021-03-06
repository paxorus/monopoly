const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const {onConnection} = require("./core/event-handlers.js");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

io.on("connection", socket => onConnection(io, socket));

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