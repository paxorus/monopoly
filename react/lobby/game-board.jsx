import {places, Locations} from "/javascripts/location-configs.js";
import validate from "/javascripts/validate-props.js";


const JAIL_VERTICAL_WALKWAY_CAPACITY = 3;

class GameBoard extends React.Component {
	constructor(props) {
		validate(super(props));

		this.squareWidth = 68;
		this.squareHeight = 66;
		this.borders = 2;
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

		return <div key={placeIdx} dataset-no={placeIdx} style={squareStyle} className={`location ${rowName}`} {...additionalProps}>
			{this.renderSquareType(place, placeIdx, rowName, walkwayStyle, walkwayClass)}
		</div>;
	}

	renderSquareType(place, placeIdx, rowName, walkwayStyle, walkwayClass) {
		// const players = this.props.players.filter(player => player.placeIdx === placeIdx);
		let players = [];
		if (this.props.players.length > 0) {
			players = [
				this.props.players[0],
				this.props.players[0],
				this.props.players[0],
				this.props.players[0],
				this.props.players[0]
			];
		}

		if (place.housePrice > 0) {
			return <div className={`walkway ${walkwayClass}`} style={walkwayStyle}>
				{/* Property walkway */}
				{this.renderPlayerSprites(players)}
				{/* House plot */}
				<div id={`house-plot${placeIdx}`} className={`house-plot-${rowName}`}></div>
			</div>;
		} else if (placeIdx === Locations.Jail) {
			// Jail
			const inJail = this.renderPlayerSprites(players.filter(player => player.jailDays > 0));
			const justVisiting = this.renderPlayerSprites(players.filter(player => player.jailDays === 0));
			return <div>
				<div id="jail">{inJail}</div>
				<div id="jail-vertical-walkway">{justVisiting.slice(0, JAIL_VERTICAL_WALKWAY_CAPACITY)}</div>
				<div id="jail-horizontal-walkway">{justVisiting.slice(JAIL_VERTICAL_WALKWAY_CAPACITY)}</div>
			</div>;
		} else {
			return this.renderPlayerSprites(players);
		}
	}

	renderPlayerSprites(players) {
		return players.map(player =>
			<img id={`marker${player.num}`} key={player.num} className="circ" src={player.spriteFileName} />
		)
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