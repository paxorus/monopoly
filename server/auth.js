let Data = require("./storage/data.js");

const og_Data = Data;

function _inject(mock_Data) {
	Data = mock_Data;
}

function _uninject() {
	Data = og_Data;
}


function setNewPlayerAndCookies(res) {
	const userId = randomId();
	const secretKey = randomId();

	res.cookie("userId", userId, {httpOnly: true});
	res.cookie("secretKey", secretKey, {httpOnly: true});

	Data.users[userId] = {
		gameIds: [],
		lobbyIds: [],
		secretKey
	};

	return userId;
}

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


function randomId() {
	// 26^20 possibilities = 94 bits
	let id = "";
	for (let i = 0; i < 20; i ++) {
		const charCode = Math.floor(Math.random() * 26) + 97;
		id += String.fromCharCode(charCode);
	}

	return id;
}

module.exports = {
	setNewPlayerAndCookies,
	httpAuthenticatePlayer,
	socketAuthenticatePlayer,
	randomId,
	_inject,
	_uninject
};