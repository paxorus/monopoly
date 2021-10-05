let Lookup = require("./storage/lookup.js");
let RandomInt = require("./fickle/random-int.js");


function setNewPlayerAndCookies(res) {
	const userId = randomId();
	const secretKey = randomId();

	res.cookie("userId", userId, {httpOnly: true});
	res.cookie("secretKey", secretKey, {httpOnly: true});

	Lookup.createUser(userId, {
		gameIds: [],
		lobbyIds: [],
		secretKey
	});

	return userId;
}

function httpAuthenticatePlayer(res, userId, secretKey) {
	const user = Lookup.fetchUser(userId);

	if (user === undefined) {
		res.status(401);
		res.send("401 (Unauthorized): User not recognized");
		return false;
	}

	if (user.secretKey !== secretKey) {
		res.status(401);
		res.send("401 (Unauthorized): User recognized but does not match device");
		return false;
	}

	return true;
}

function socketAuthenticatePlayer(socket, userId, secretKey) {
	const user = Lookup.fetchUser(userId);

	if (user === undefined) {
		// Invalid user ID.
		socket.emit("bad-user-id");
		return false;
	}

	if (user.secretKey !== secretKey) {
		// Invalid secret key.
		socket.emit("bad-secret-key");
		return false;
	}

	return true;
}


const lowerCaseA = "a".charCodeAt(0);
const lowerCaseZ = "z".charCodeAt(0);

function randomId() {
	// 26^20 possibilities = 94 bits
	let id = "";
	for (let i = 0; i < 20; i ++) {
		const charCode = RandomInt.fromRange(lowerCaseA, lowerCaseZ);
		id += String.fromCharCode(charCode);
	}

	return id;
}

module.exports = {
	setNewPlayerAndCookies,
	httpAuthenticatePlayer,
	socketAuthenticatePlayer,
	randomId
};