const assert = require("assert");
const {setNewPlayerAndCookies, httpAuthenticatePlayer, socketAuthenticatePlayer, randomId, _inject, _uninject} = require("../auth.js");

describe("Auth", () => {

	describe("#setNewPlayerAndCookies()", () => {
		it("registers the new user and return the key-value pair as cookies to the client", () => {
			const mockData = {users: {}};
			const mockResponse = {
				cookies: {},
				cookie: function (cookieName, cookieValue, options) {
					assert.deepEqual(options, {httpOnly: true});
					this.cookies[cookieName] = cookieValue;
				}
			};
			_inject(mockData);

			setNewPlayerAndCookies(mockResponse);

			const {userId, secretKey} = mockResponse.cookies;
			assert.deepEqual(mockData, {
				"users": {
					[userId]: {
						"gameIds": [],
						"lobbyIds": [],
						"secretKey": secretKey
					},
				}
			});

			_uninject();
		});
	});

	describe("#httpAuthenticatePlayer()", () => {
		it("rejects an unknown user id", () => {
			const mockData = {users: {}};
			const mockResponse = {
				status: function (statusCode) {this.statusCode = statusCode},
				send: function (message) {this.message = message}
			};
			_inject(mockData);

			const success = httpAuthenticatePlayer(mockResponse, "unknown user id", "any secret key");

			assert.equal(success, false);
			assert.equal(mockResponse.statusCode, 401);
			assert.equal(mockResponse.message, "401 (Unauthorized): Player not recognized");
			_uninject();
		});

		it("rejects a mismatching secret key", () => {
			const mockData = {users: {
				"my user id": {
					secretKey: "my secret key"
				}
			}};
			const mockResponse = {
				status: function (statusCode) {this.statusCode = statusCode},
				send: function (message) {this.message = message}
			};
			_inject(mockData);

			const success = httpAuthenticatePlayer(mockResponse, "my user id", "wrong secret key");

			assert.equal(success, false);
			assert.equal(mockResponse.statusCode, 401);
			assert.equal(mockResponse.message, "401 (Unauthorized): Player recognized but does not match device");
			_uninject();
		});

		it("accepts a known user with their matching secret key", () => {
			const mockData = {users: {
				"my user id": {
					secretKey: "my secret key"
				}
			}};
			const mockResponse = {
				status: function (statusCode) {this.statusCode = statusCode},
				send: function (message) {this.message = message}
			};
			_inject(mockData);

			const success = httpAuthenticatePlayer(mockResponse, "my user id", "my secret key");

			assert.equal(success, true);
			assert.equal(mockResponse.statusCode, undefined);
			assert.equal(mockResponse.message, undefined);
			_uninject();
		});
	});

	describe("#socketAuthenticatePlayer()", () => {
		it("rejects an unknown user id", () => {
			const mockData = {users: {}};
			const mockSocket = {
				emit: function (eventName) {this.eventName = eventName}
			};
			_inject(mockData);

			const success = socketAuthenticatePlayer(mockSocket, "unknown user id", "any secret key");

			assert.equal(success, false);
			assert.equal(mockSocket.eventName, "bad-player-id");
			_uninject();
		});

		it("rejects a mismatching secret key", () => {
			const mockData = {users: {
				"my user id": {
					secretKey: "my secret key"
				}
			}};
			const mockSocket = {
				emit: function (eventName) {this.eventName = eventName}
			};
			_inject(mockData);

			const success = socketAuthenticatePlayer(mockSocket, "my user id", "wrong secret key");

			assert.equal(success, false);
			assert.equal(mockSocket.eventName, "bad-secret-key");
			_uninject();
		});

		it("accepts a known user with their matching secret key", () => {
			const mockData = {users: {
				"my user id": {
					secretKey: "my secret key"
				}
			}};
			const mockSocket = {
				emit: function (eventName) {this.eventName = eventName}
			};
			_inject(mockData);

			const success = socketAuthenticatePlayer(mockSocket, "my user id", "my secret key");

			assert.equal(success, true);
			assert.equal(mockSocket.eventName, undefined);
			_uninject();
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
