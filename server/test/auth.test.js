const assert = require("assert");
const proxyquire = require("proxyquire");


describe("Auth", () => {

	const mockUsers = {
		"my user id": {
			"secretKey": "my secret key"
		}
	};
	const {
		httpAuthenticatePlayer,
		socketAuthenticatePlayer,
		setNewPlayerAndCookies,
		randomId
	} = proxyquire("../auth.js", {
		"./storage/lookup.js": {
			createUser(userId, user) {mockUsers[userId] = user},
			fetchUser(userId) {return mockUsers[userId]}
		}
	});

	describe("#setNewPlayerAndCookies()", () => {
		it("registers the new user and return the key-value pair as cookies to the client", () => {

			const mockResponse = {
				cookies: {},
				cookie: function (cookieName, cookieValue, options) {
					assert.deepEqual(options, {httpOnly: true});
					this.cookies[cookieName] = cookieValue;
				}
			};

			setNewPlayerAndCookies(mockResponse);

			const {userId, secretKey} = mockResponse.cookies;
			assert.deepEqual(mockUsers[userId], {
				"gameIds": [],
				"lobbyIds": [],
				"secretKey": secretKey
			});
		});
	});

	describe("#httpAuthenticatePlayer()", () => {
		// it("rejects an unknown user id", () => {
		// 	const mockResponse = {
		// 		status: function (statusCode) {this.statusCode = statusCode},
		// 		send: function (message) {this.message = message}
		// 	};

		// 	const success = httpAuthenticatePlayer(mockResponse, "unknown user id", "any secret key");

		// 	assert.equal(success, false);
		// 	assert.equal(mockResponse.statusCode, 401);
		// 	assert.equal(mockResponse.message, "401 (Unauthorized): User not recognized");
		// });

		it("rejects a mismatching secret key", () => {
			const mockResponse = {
				status: function (statusCode) {this.statusCode = statusCode},
				send: function (message) {this.message = message}
			};

			const success = httpAuthenticatePlayer(mockResponse, "my user id", "wrong secret key");

			assert.equal(success, false);
			assert.equal(mockResponse.statusCode, 401);
			assert.equal(mockResponse.message, "401 (Unauthorized): User recognized but does not match device");
		});

		it("accepts a known user with their matching secret key", () => {
			const mockResponse = {
				status: function (statusCode) {this.statusCode = statusCode},
				send: function (message) {this.message = message}
			};

			const success = httpAuthenticatePlayer(mockResponse, "my user id", "my secret key");

			assert.equal(success, true);
			assert.equal(mockResponse.statusCode, undefined);
			assert.equal(mockResponse.message, undefined);
		});
	});

	describe("#socketAuthenticatePlayer()", () => {
		it("rejects an unknown user id", () => {
			const mockSocket = {
				emit: function (eventName) {this.eventName = eventName}
			};

			const success = socketAuthenticatePlayer(mockSocket, "unknown user id", "any secret key");

			assert.equal(success, false);
			assert.equal(mockSocket.eventName, "bad-user-id");
		});

		it("rejects a mismatching secret key", () => {
			const mockSocket = {
				emit: function (eventName) {this.eventName = eventName}
			};

			const success = socketAuthenticatePlayer(mockSocket, "my user id", "wrong secret key");

			assert.equal(success, false);
			assert.equal(mockSocket.eventName, "bad-secret-key");
		});

		it("accepts a known user with their matching secret key", () => {
			const mockSocket = {
				emit: function (eventName) {this.eventName = eventName}
			};

			const success = socketAuthenticatePlayer(mockSocket, "my user id", "my secret key");

			assert.equal(success, true);
			assert.equal(mockSocket.eventName, undefined);
		});
	});

	describe("#randomId()", () => {
		it("generates different IDs of length 20", () => {
			const uniqueIds = new Set();

			for (let i = 0; i < 10; i ++) {
				const id = randomId();
				assert.equal(id.length, 20);
				uniqueIds.add(id);
			}

			assert.equal(uniqueIds.size, 10);
		});
	});


});
