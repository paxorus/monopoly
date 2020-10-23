const assert = require("assert");
const {startGame} = require("../startup.js");

describe("Startup", function () {

	describe("#startGame()", function () {
		it("should bootstrap the game object", function () {
			const game = {
				lobby: {
					"player-1": {
						name: "Jimmy",
						sprite: "jimmy.png"
					},
					"player-2": {
						name: "Timmy",
						sprite: "timmy.png"
					}
				}
			};
			startGame(game);

			assert.deepEqual(new Set([
				"currentPlayerId",
				"hasStarted",
				"lobby",
				"monopolies",
				"places",
				"players",
				"tax"
			]), new Set(Object.keys(game)));

			assert.deepEqual(true, game.hasStarted);
			assert.deepEqual([], game.monopolies);
			assert.deepEqual(0, game.tax);
			assert.ok(0 <= game.currentPlayerId && game.currentPlayerId < game.players.length);

			const jimmy = game.players[0];
			assert.deepEqual(game, jimmy.game);
			assert.deepEqual("Jimmy", jimmy.name);
			assert.deepEqual("jimmy.png", jimmy.spriteFileName);
			assert.deepEqual("player-1", jimmy.userId);
			assert.deepEqual(null, jimmy.socket);
		});
	});
});
