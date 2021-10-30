import {places, Locations} from "/javascripts/location-configs.js";
import validate from "/javascripts/validate-props.js";


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
			{/* Walkway */}
			{(place.housePrice > 0) && <div className={`walkway ${walkwayClass}`} style={walkwayStyle}></div> }
			{/* House plot */}
			{(place.housePrice > 0) && <div id={`house-plot${placeIdx}`} className={`house-plot-${rowName}`}></div> }
			{/* Jail */}
			{(placeIdx === Locations.Jail) && <div id="jail"></div> }
			{/* Jail vertical walkway */}
			{(placeIdx === Locations.Jail) && <div id="jail-vertical-walkway"></div> }
			{/* Jail horizontal walkway */}
			{(placeIdx === Locations.Jail) && <div id="jail-horizontal-walkway"></div> }
		</div>;
	}

	render() {
		return <div id="board" style={{opacity: 0.2}}>
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

GameBoard.propTypes = {};

export default GameBoard;