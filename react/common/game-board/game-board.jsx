import GameBoardSquare from "/javascripts/common/game-board/game-board-square.js";
import {Place} from "/javascripts/common/models/place.js";
import Player from "/javascripts/common/models/player.js";
import validate from "/javascripts/validate-props.js";

const MOVE_ANIMATION_LENGTH = 6;
const STEP_DURATION_MS = 50;


class GameBoard extends React.Component {
	constructor(props) {
		validate(super(props));

		this.state = {
			playerMotions: {}
		};

		this.timeoutIds = {};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// If players set: initialize motion vectors.
		if (prevProps.players.length === 0 && this.props.players.length > 0) {
			this.setState((state, props) => ({
				playerMotions: Object.fromEntries(props.players.map(player => [player.num, {current: player.placeIdx}]))
			}));
		}

		// If player location changed: start player motion.
		prevProps.players.forEach(player => {
			const targetPlaceIdx = this.props.players[player.num].placeIdx;
			if (player.placeIdx !== targetPlaceIdx) {
				this.startPlayerMotion(player, targetPlaceIdx);
			}
		});
	}

	startPlayerMotion(player, targetPlaceIdx) {
		const {num, placeIdx} = player;
		clearTimeout(this.timeoutIds[num]);
		this.setState(state => ({
			playerMotions: {
				...state.playerMotions,
				[num]: {
					end: targetPlaceIdx,
					start: placeIdx,
					current: placeIdx,
					swanSongIdx: 0
				}
			}
		}));
		this.animateSprite(num, placeIdx, 0, targetPlaceIdx);		
	}

	animateSprite(playerNum, currentPlaceIdx, swanSongIdx, endPlaceIdx) {
		this.timeoutIds[playerNum] = setTimeout(() => {
			this.setState(state => {
				const newCurrentIdx = boardSum(currentPlaceIdx, 1);

				if (newCurrentIdx === endPlaceIdx) {
					this.animateChemTrailSwanSong(playerNum, newCurrentIdx, 0, endPlaceIdx);
				} else {
					this.animateSprite(playerNum, newCurrentIdx, 0, endPlaceIdx);
				}

				return {
					playerMotions: {
						...state.playerMotions,
						[playerNum]: {
							...state.playerMotions[playerNum],
							current: newCurrentIdx
						}
					}
				};
			});
		}, STEP_DURATION_MS);
	}

	animateChemTrailSwanSong(playerNum, currentPlaceIdx, swanSongIdx, endPlaceIdx) {
		// Run the swan song to clean up the chem trail, now that the player has reached their destination.
		setTimeout(() => {
			this.setState(state => {
				if (swanSongIdx === MOVE_ANIMATION_LENGTH) {
					// End the animation.
					return {
						playerMotions: {
							...state.playerMotions,
							[playerNum]: {
								current: currentPlaceIdx
							}
						}
					};
				} else {
					this.animateChemTrailSwanSong(playerNum, currentPlaceIdx, swanSongIdx + 1, endPlaceIdx);
					return {
						playerMotions: {
							...state.playerMotions,
							[playerNum]: {
								...state.playerMotions[playerNum],
								swanSongIdx
							}
						}
					};
				}
			});
		}, STEP_DURATION_MS);
	}

	getFrame(placeIdx) {
		const playerFrames = Object.entries(this.state.playerMotions)
			.filter(([playerNum, playerMotion]) => playerMotion.end !== undefined)
			.map(([playerNum, playerMotion]) => [playerNum, ...this.getFrameForPlayer(placeIdx, playerMotion)]);
		const playersWithAfterImages = Object.fromEntries(playerFrames
			.map(([playerNum, isAfterImage, chemTrailSize]) => [playerNum, isAfterImage]));
		const chemTrailSize = playerFrames
			.reduce((accumulator, [playerNum, isAfterImage, chemTrailSize]) => Math.max(accumulator, chemTrailSize), 0);

		return {
			playersWithAfterImages,
			chemTrailSize
		};
	}

	getFrameForPlayer(placeIdx, playerMotion) {
		const {start, current, swanSongIdx, end} = playerMotion;

		if (start <= current && (placeIdx < start || placeIdx >= current)) {
			return [false, 0];
		}

		if (start > current && (placeIdx < start && placeIdx >= current)) {
			return [false, 0];
		}

		const frameNumber = boardMinus(boardSum(current, swanSongIdx), placeIdx);

		if (frameNumber === 1) {
			// Show player's after-image.
			return [true, 0];
		}

		// Show chem trail.
		let chemTrailSize = 0;
		if (frameNumber >= 2 && frameNumber <= MOVE_ANIMATION_LENGTH) {
			// Given [2, MOVE_ANIMATION_LENGTH], output [60, 0].
			chemTrailSize = 60 - 60 / (MOVE_ANIMATION_LENGTH - 2) * (frameNumber - 2);
		}

		return [false, chemTrailSize];
	}

	isPlayerHere(player, placeIdx) {
		const playerMotion = this.state.playerMotions[player.num];
		if (playerMotion === undefined) {
			// Player's location state has not been initialized yet.
			return false;
		}
		return playerMotion.current === placeIdx;
	}

	renderSquare(placeIdx, rowName) {
		const {playersWithAfterImages, chemTrailSize} = this.getFrame(placeIdx);
		const houseCount = (placeIdx in this.props.places) ? this.props.places[placeIdx].houseCount : 0;
		const players = this.props.players.filter(player => this.isPlayerHere(player, placeIdx));
		const afterImages = this.props.players.filter(player => this.isPlayerHere(player, boardSum(placeIdx + 1)) && playersWithAfterImages[player.num]);

		return <GameBoardSquare
			key={placeIdx}
			placeIdx={placeIdx}
			rowName={rowName}
			isHighlighted={this.props.highlightedPlaces.has(placeIdx)}
			players={players}
			afterImages={afterImages}
			chemTrailSize={chemTrailSize}
			houseCount={houseCount}

			onClickLocation={this.props.onClickLocation}
			onClickPlayer={this.props.onClickPlayer}
			onMouseOverPlayer={this.props.onMouseOverPlayer} />;
	}

	render() {
		return <div style={{opacity: this.props.faded ? 0.2 : 1}}>
			{/* Bottom row */}
			{range(0, 10).map(placeIdx => this.renderSquare(placeIdx, "bottom"))}
			{/* Left row */}
			{range(10, 20).map(placeIdx => this.renderSquare(placeIdx, "left"))}
			{/* Top row */}
			{range(20, 30).map(placeIdx => this.renderSquare(placeIdx, "top"))}
			{/* Right row */}
			{range(30, 40).map(placeIdx => this.renderSquare(placeIdx, "right"))}
		</div>
	}
}

function boardSum(a, b) {
	return (a + b) % 40;
}

function boardMinus(a, b) {
	return (a - b + 40) % 40;
}

function range(a, b) {
	// (5, 10) -> [5,6,7,8,9]
	return new Array(b - a).fill(0).map((_, i) => i + a);
}


GameBoard.propTypes = {
	faded: PropTypes.bool,
	highlightedPlaces: PropTypes.instanceOf(Set),
	players: PropTypes.arrayOf(PropTypes.instanceOf(Player)),
	places: PropTypes.arrayOf(PropTypes.instanceOf(Place)),
	onClickLocation: PropTypes.func,
	onClickPlayer: PropTypes.func,
	onMouseOverPlayer: PropTypes.func
};

GameBoard.defaultProps = {
	faded: false,
	players: [],
	places: [],
	highlightedPlaces: new Set(),
	onClickLocation: () => {},
	onClickPlayer: () => {},
	onMouseOverPlayer: () => {}
}

export default GameBoard;