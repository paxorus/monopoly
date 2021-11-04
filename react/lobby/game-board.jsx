import {places, Locations} from "/javascripts/location-configs.js";
import validate from "/javascripts/validate-props.js";


const JAIL_VERTICAL_WALKWAY_CAPACITY = 3;
const MOVE_ANIMATION_LENGTH = 6;
const STEP_DURATION_MS = 250;// 50

class GameBoard extends React.Component {
	constructor(props) {
		validate(super(props));

		this.squareWidth = 68;
		this.squareHeight = 66;
		this.borders = 2;

		this.state = {
			playerMotions: {}
		};

		this.timeoutIds = {};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// If players set: initialize motion vectors.
		if (prevProps.players.length === 0) {
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

	range(a, b) {
		// (5, 10) -> [5,6,7,8,9]
		return new Array(b - a).fill(0).map((_, i) => i + a);
	}

	getSquarePosition(rowName, placeIdx) {
		switch (rowName) {
			case "bottom":
				return {left: (this.borders + this.squareWidth) * (10 - placeIdx) + "px"};
			case "left":
				return {top: (this.borders + this.squareHeight) * (10 - placeIdx) + "px"};
			case "top":
				return {left: (this.borders + this.squareWidth) * placeIdx + "px"};
			case "right":
				return {top: (this.borders + this.squareHeight) * placeIdx + "px"};
		}
	}

	getSquareBackground(place) {
		if (place.imageName) {
			return {
				backgroundImage: `url('${place.imageName}')`,
				backgroundRepeat: "no-repeat",
				backgroundSize: `${this.squareWidth}px ${this.squareHeight}px`
			};
		} else {
			return {
				backgroundColor: place.color
			};
		}
	}

	buildSquare(placeIdx, rowName, walkwayStyle, walkwayClass) {
		const place = places[placeIdx];

		const squareStyle = {
			...this.getSquarePosition(rowName, placeIdx % 10),
			...this.getSquareBackground(place)
		};

		const additionalProps = (placeIdx == Locations.FreeParking) ? {id: "alltax"} : {};

		const {playersWithAfterImages, chemTrailSize} = this.getFrame(placeIdx);

		return <div key={placeIdx} dataset-no={placeIdx} style={squareStyle} className={`location ${rowName}`} {...additionalProps}>
			{this.renderSquareType(place, placeIdx, rowName, walkwayStyle, walkwayClass, playersWithAfterImages)}
			<div className="chem-trail" style={{width: `${chemTrailSize}px`, height: `${chemTrailSize}px`, marginLeft: `-${chemTrailSize/2}px`, marginTop: `-${chemTrailSize/2}px`}}></div>
		</div>;
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

	renderSquareType(place, placeIdx, rowName, walkwayStyle, walkwayClass, playersWithAfterImages) {
		const players = this.props.players.filter(player => this.isPlayerHere(player, placeIdx));
		const afterImages = this.props.players.filter(player => this.isPlayerHere(player, placeIdx + 1) && playersWithAfterImages[player.num]);

		if (place.housePrice > 0) {
			return <div className={`walkway ${walkwayClass}`} style={walkwayStyle}>
				{/* Property walkway */}
				{this.renderPlayerSprites(players, afterImages)}
				{/* House plot */}
				<div id={`house-plot${placeIdx}`} className={`house-plot-${rowName}`}></div>
			</div>;
		} else if (placeIdx === Locations.Jail) {
			// Jail
			const inJail = this.renderPlayerSprites(players.filter(player => player.jailDays > 0), []);
			const justVisiting = this.renderPlayerSprites(players.filter(player => player.jailDays === 0), afterImages);
			return <div>
				<div id="jail">{inJail}</div>
				<div id="jail-vertical-walkway">{justVisiting.slice(0, JAIL_VERTICAL_WALKWAY_CAPACITY)}</div>
				<div id="jail-horizontal-walkway">{justVisiting.slice(JAIL_VERTICAL_WALKWAY_CAPACITY)}</div>
			</div>;
		} else {
			return this.renderPlayerSprites(players, afterImages);
		}
	}

	renderPlayerSprites(players, afterImages) {
		return [
			...players.map(player =>
				<img id={`marker${player.num}`} key={player.num} className="circ" src={player.spriteFileName} />),
			...afterImages.map(player =>
				<img id={`marker${player.num}`} key={player.num} className="circ" src={player.spriteFileName} style={{opacity: 0.5}} />)
		]
	}

	render() {
		return <div id="board" style={{opacity: this.props.faded ? 0.2 : 1}}>
			{/* Bottom row */}
			{this.range(0, 10).map(placeIdx => this.buildSquare(
				placeIdx,
				"bottom",
				{bottom: 0},
				"horizontal"
			))}
			{/* Left row */}
			{this.range(10, 20).map(placeIdx => this.buildSquare(
				placeIdx,
				"left",
				{left: 0},
				"vertical"
			))}
			{/* Left row */}
			{this.range(20, 30).map(placeIdx => this.buildSquare(
				placeIdx,
				"top",
				{top: 0},
				"horizontal"
			))}
			{/* Left row */}
			{this.range(30, 40).map(placeIdx => this.buildSquare(
				placeIdx,
				"right",
				{right: 0},
				"vertical"
			))}
		</div>
	}
}

function boardSum(a, b) {
	return (a + b) % 40;
}

function boardMinus(a, b) {
	return (a - b + 40) % 40;
}

GameBoard.propTypes = {
	faded: PropTypes.bool,
	players: PropTypes.arrayOf(PropTypes.exact({
		num: PropTypes.number,
		spriteFileName: PropTypes.string,
		placeIdx: PropTypes.number,
		jailDays: PropTypes.number
	}))
};

GameBoard.defaultProps = {
	faded: false,
	players: []
}

export default GameBoard;