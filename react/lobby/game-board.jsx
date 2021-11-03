import {places, Locations} from "/javascripts/location-configs.js";
import validate from "/javascripts/validate-props.js";


const JAIL_VERTICAL_WALKWAY_CAPACITY = 3;
const MOVE_ANIMATION_LENGTH = 6;

class GameBoard extends React.Component {
	constructor(props) {
		validate(super(props));

		this.squareWidth = 68;
		this.squareHeight = 66;
		this.borders = 2;

		this.state = {
			playerMotions: {}
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// If players set.
		if (prevProps.players.length === 0) {
			this.setState((state, props) => ({
				playerMotions: Object.fromEntries(props.players.map(player => [player.num, {current: player.placeIdx}]))
			}));
		}

		// If player location changed.
		prevProps.players.forEach(player => {
			const targetPlaceIdx = this.props.players[player.num].placeIdx;
			if (player.placeIdx !== targetPlaceIdx) {
				this.setState(state => ({
					playerMotions: {
						...state.playerMotions,
						[player.num]: {
							end: targetPlaceIdx,
							start: player.placeIdx,
							current: player.placeIdx,
							head: player.placeIdx
						}
					}
				}));
				this.animateSprite(player.num, player.placeIdx, player.placeIdx, targetPlaceIdx);
			}
		});
	}

	animateSprite(playerNum, currentPlaceIdx, headPlaceIdx, endPlaceIdx) {
		// headPlaceIdx: A pointer to the head of the theoretical train that continues moving
		// even after currentPlaceIdx reaches endPlaceIdx, to dissolve the residual chem trail.
		setTimeout(() => {
			this.setState(state => {
				const newCurrentIdx = (currentPlaceIdx === endPlaceIdx) ? endPlaceIdx : boardSum(currentPlaceIdx, 1);
				const newHeadIdx = boardSum(headPlaceIdx, 1);

				if (newHeadIdx === boardSum(endPlaceIdx, MOVE_ANIMATION_LENGTH)) {
					// End the animation.
					return {
						playerMotions: {
							...state.playerMotions,
							[playerNum]: {
								current: newCurrentIdx
							}
						}
					};
				}

				this.animateSprite(playerNum, newCurrentIdx, newHeadIdx, endPlaceIdx);

				return {
					playerMotions: {
						...state.playerMotions,
						[playerNum]: {
							...state.playerMotions[playerNum],
							current: newCurrentIdx,
							head: newHeadIdx
						}
					}
				};
			});
		}, 50);
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

		const [isAfterImage, chemTrailSize] = this.getFrame(placeIdx);

		return <div key={placeIdx} dataset-no={placeIdx} style={squareStyle} className={`location ${rowName}`} {...additionalProps}>
			{this.renderSquareType(place, placeIdx, rowName, walkwayStyle, walkwayClass, isAfterImage)}
			<div className="chem-trail" style={{width: `${chemTrailSize}px`, height: `${chemTrailSize}px`, marginLeft: `-${chemTrailSize/2}px`, marginTop: `-${chemTrailSize/2}px`}}></div>
		</div>;
	}

	getFrame(placeIdx) {
		const arePlayersStill = Object.values(this.state.playerMotions).every(({end}) => end === undefined);
		if (arePlayersStill) {
			return [false, 0];
		}
		const {start, current, head, end} = this.state.playerMotions[0];

		if (start < end && (placeIdx < start || placeIdx >= current)) {
			return [false, 0];
		}

		if (start > end && (placeIdx < start && placeIdx >= current)) {
			return [false, 0];
		}

		const frameNumber = boardMinus(head, placeIdx);

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

	renderSquareType(place, placeIdx, rowName, walkwayStyle, walkwayClass, isAfterImage) {
		const players = this.props.players.filter(player => this.isPlayerHere(player, placeIdx));
		const afterImages = this.props.players.filter(player => this.isPlayerHere(player, placeIdx + 1) && isAfterImage);

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