import GameBoard from "/javascripts/common/game-board.js";
import assert from "/javascripts/test/assert.js";


describe("Game Board", () => {

	let clock;

	before(() => {
		clock = sinon.useFakeTimers({toFake: ["setTimeout"]});
	});
	after(() => {
		clock.restore();
	});

	const mockPlayer0 = {num: 0, spriteFileName: "", placeIdx: 0, jailDays: 0};

	const mockProps = {
		faded: false,
		players: [
			mockPlayer0,
			{num: 1, spriteFileName: "", placeIdx: 0, jailDays: 0}
		]
	};

	describe("#startPlayerMotion()", () => {
		it("initializes the player motion", () => {
			const gameBoard = new MockGameBoard(mockProps);

			gameBoard.startPlayerMotion(mockPlayer0, 5);

			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 0, end: 5, swanSongIdx: 0}
			});
			assert.deepEqual(Object.keys(gameBoard.timeoutIds), ["0"]);
		});

		it("moves the player forward", () => {
			const gameBoard = new MockGameBoard(mockProps);
			gameBoard.startPlayerMotion(mockPlayer0, 5);

			clock.tick(50);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 1, end: 5, swanSongIdx: 0}
			});

			clock.tick(100);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 3, end: 5, swanSongIdx: 0}
			});

			clock.tick(100);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 5, end: 5, swanSongIdx: 0}
			});
		});

		it("runs the swan song sequence", () => {
			const gameBoard = new MockGameBoard(mockProps);
			gameBoard.startPlayerMotion(mockPlayer0, 5);

			clock.tick(250);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 5, end: 5, swanSongIdx: 0}
			});

			// TODO: First tick does nothing.
			clock.tick(50);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 5, end: 5, swanSongIdx: 0}
			});

			clock.tick(50);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 5, end: 5, swanSongIdx: 1}
			});

			clock.tick(100);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 5, end: 5, swanSongIdx: 3}
			});

			clock.tick(100);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {start: 0, current: 5, end: 5, swanSongIdx: 5}
			});

			clock.tick(50);
			assert.deepEqual(gameBoard.state.playerMotions, {
				0: {current: 5}
			});
		});
	});

	describe("#getFrameForPlayer()", () => {
		it("leaves a chem trail and an after-image", () => {
			const gameBoard = new MockGameBoard(mockProps);
			gameBoard.startPlayerMotion(mockPlayer0, 5);

			const getFrameForPlayer = () => gameBoard.getFrameForPlayer(0, gameBoard.state.playerMotions[0]);

			assert.deepEqual(getFrameForPlayer(), [false, 0]);
			clock.tick(50);
			assert.deepEqual(getFrameForPlayer(), [true, 0]);
			clock.tick(50);
			assert.deepEqual(getFrameForPlayer(), [false, 60]);
			clock.tick(50);
			assert.deepEqual(getFrameForPlayer(), [false, 45]);
			clock.tick(50);
			assert.deepEqual(getFrameForPlayer(), [false, 30]);
			clock.tick(50);
			assert.deepEqual(getFrameForPlayer(), [false, 15]);
			clock.tick(50);
			// TODO: This tick does nothing.
			assert.deepEqual(getFrameForPlayer(), [false, 15]);
			clock.tick(50);
			assert.deepEqual(getFrameForPlayer(), [false, 0]);
		});

		it("doesn't animate squares before the start of the journey, or beyond the current player", () => {
			const gameBoard = new MockGameBoard(mockProps);
			const motion = {start: 5, end: 20, current: 17, swanSongIdx: 0};

			assert.deepEqual(gameBoard.getFrameForPlayer(4, motion), [false, 0]);
			assert.deepEqual(gameBoard.getFrameForPlayer(5, motion), [false, 0]);

			assert.deepEqual(gameBoard.getFrameForPlayer(7, motion), [false, 0]);
			assert.deepEqual(gameBoard.getFrameForPlayer(8, motion), [false, 0]);
		});

		it("doesn't animate squares before the start of the journey, or beyond the current player who has passed Go", () => {
			const gameBoard = new MockGameBoard(mockProps);
			const motion = {start: 35, end: 10, current: 7, swanSongIdx: 0};

			assert.deepEqual(gameBoard.getFrameForPlayer(34, motion), [false, 0]);
			assert.deepEqual(gameBoard.getFrameForPlayer(35, motion), [false, 0]);

			assert.deepEqual(gameBoard.getFrameForPlayer(7, motion), [false, 0]);
			assert.deepEqual(gameBoard.getFrameForPlayer(8, motion), [false, 0]);
		});
	});

	describe("#getFrame()", () => {
		it("finds all the relevant after-images", () => {
			const gameBoard = new MockGameBoard(mockProps);
			gameBoard.state.playerMotions = {
				0: {start: 10, end: 30, current: 20, swanSongIdx: 0},
				1: {start: 15, end: 25, current: 20, swanSongIdx: 0},
				2: {start: 15, end: 25, current: 21, swanSongIdx: 0}
			};
			assert.deepEqual(gameBoard.getFrame(19), {
				playersWithAfterImages: {0: true, 1: true, 2: false},
				chemTrailSize: 60
			});
		});

		it("takes the max chem trail size from among the players", () => {
			const gameBoard = new MockGameBoard(mockProps);
			gameBoard.state.playerMotions = {
				0: {start: 0, end: 30, current: 21, swanSongIdx: 0},
				1: {start: 0, end: 30, current: 22, swanSongIdx: 0},
				2: {start: 0, end: 30, current: 24, swanSongIdx: 0}
			};
			assert.deepEqual(gameBoard.getFrame(19), {
				playersWithAfterImages: {0: false, 1: false, 2: false},
				chemTrailSize: 60
			});
		});
	});

	class MockGameBoard extends GameBoard {
		setState(mapOrFunc) {
			if (typeof mapOrFunc === "function") {
				const prevState = this.state;
				this.state = {...prevState, ...mapOrFunc(prevState)};
			} else {
				this.state = mapOrFunc;
			}
		}
	}
});

