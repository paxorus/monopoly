import CollapsedSprite from "/javascripts/common/game-board/collapsed-sprite.js";
import {BLACK_TEXT_COLORS, Locations, PlaceConfigs, Railroads, Utilities} from "/javascripts/gameplay/location-configs.js";
import PlayerSprite from "/javascripts/common/game-board/player-sprite.js";
import Player from "/javascripts/common/models/player.js";
import SpritePositionUtil from "/javascripts/common/game-board/sprite-position-util.js";
import validate from "/javascripts/validate-props.js";

const JAIL_VERTICAL_WALKWAY_CAPACITY = 3;
const MOVE_ANIMATION_LENGTH = 6;


class GameBoardSquare extends React.Component {
	constructor(props) {
		validate(super(props));

		this.squareWidth = 68;
		this.squareHeight = 66;
		this.borders = 2;

		// Dashboard (400) + messages (300 + 8) - left game border (2) = 706
		this.boardOrigin = {x: 706, y: 42};
	}

	handleClickPlayer(event, playerNum) {
		event.stopPropagation();// Don't propagate player clicks to the square.
		this.props.onClickPlayer(playerNum);
	}

	getSquarePosition(rowName, placeIdx) {
		switch (rowName) {
			case "bottom":
				return {
					left: (this.borders + this.squareWidth) * (10 - placeIdx) + this.boardOrigin.x + "px",
					top: (this.borders + this.squareHeight) * 10 + this.boardOrigin.y + "px"
				};
			case "left":
				return {
					left: this.boardOrigin.x + "px",
					top: (this.borders + this.squareHeight) * (10 - placeIdx) + this.boardOrigin.y + "px"
				};
			case "top":
				return {
					left: (this.borders + this.squareWidth) * placeIdx + this.boardOrigin.x + "px",
					top: this.boardOrigin.y + "px"
				};
			case "right":
				return {
					left: (this.borders + this.squareWidth) * 10 + this.boardOrigin.x + "px",
					top: (this.borders + this.squareHeight) * placeIdx + this.boardOrigin.y + "px"
				};
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

	renderSquareType(place, placeIdx, rowName) {
		const {players, afterImages} = this.props;
		if (place.housePrice > 0) {
			return this.renderProperty(place, players, afterImages, placeIdx, rowName);
		} else if (placeIdx === Locations.Jail) {
			return this.renderJail(players, afterImages);
		} else if (Railroads.includes(placeIdx)) {
			return this.renderRailroad(place, players, afterImages);
		} else {
			return this.renderPlayersHorizontally(players, afterImages);
		}
	}

	renderPlayerSprite([player, isAfterImage], horizontalAlign, verticalAlign, mini) {
		const extraClasses = mini ? ["sprite-circle-mini"] : [];
		return <PlayerSprite key={player.num}
			spriteFileName={player.spriteFileName}
			borderColor={player.borderColor}
			faded={isAfterImage}

			onClick={event => this.handleClickPlayer(event, player.num)}
			onMouseOver={overOrOut => this.props.onMouseOverPlayer(player.num, overOrOut)}

			extraClasses={extraClasses}
			extraStyle={{
				...SpritePositionUtil.getPositionStyle({mini, horizontalAlign, verticalAlign})
			}} />;
		}

	renderCollapsedSprite(players, horizontalAlign, verticalAlign, mini) {
		return <CollapsedSprite key={players[0].num}
			horizontalAlign={horizontalAlign}
			verticalAlign={verticalAlign}
			mini={mini || false}>
				{players.map(player => <PlayerSprite key={player.num}
					spriteFileName={player.spriteFileName}
					borderColor={player.borderColor}

					onClick={event => this.handleClickPlayer(event, player.num)}
					onMouseOver={overOrOut => this.props.onMouseOverPlayer(player.num, overOrOut)}

					extraClasses={["inline"]}
					extraStyle={{margin: "0 3px"}} />)}
		</CollapsedSprite>;
	}

	renderProperty(place, players, afterImages, placeIdx, rowName) {
		const walkwayStyle = {[rowName]: 0};
		const walkwayClass = (rowName === "top" || rowName === "bottom") ? "horizontal" : "vertical";
		const walkwayHighlightedClass = this.props.isHighlighted ? "location-highlighted" : "";

		return [
			<div key={0} className={`walkway ${walkwayClass} ${walkwayHighlightedClass}`} style={walkwayStyle}>
				{/* Property walkway */}
				{walkwayClass === "horizontal" ?
					this.renderPlayersHorizontally(players, afterImages) :
					this.renderPlayersVertically(players, afterImages)}
			</div>,
			<div key={1} className={`house-plot-${rowName}`}>
				{(this.props.houseCount === 0) ?
					<span className={`place-name place-name-${rowName}`} style={{
						color: BLACK_TEXT_COLORS.has(placeIdx) ? "black" : "#eee"
					}}>
						{place.shortName || place.name}
					</span> :
					((this.props.houseCount < 5) ?
						repeat(this.props.houseCount, i => this.renderBuildingIcon(placeIdx, "house", i)) :
						this.renderBuildingIcon(placeIdx, "hotel", 0))}
			</div>
		];
	}

	renderRailroad(place, players, afterImages) {
		const sprites = this.renderPlayersHorizontally(players, afterImages);
		if (sprites.length > 0) {
			return sprites;
		}
		return <div key={"railroad-name"} className="railroad-name">{place.shortName || place.name}</div>;
	}

	renderPlayersVertically(players, afterImages) {
		const sprites = [
			...players.map(player => ([player, false])),
			...afterImages.map(afterImage => ([afterImage, true]))
		];

		switch (sprites.length) {
			case 0:
				return [];

			case 1:
				return [this.renderPlayerSprite(sprites[0], "center", "center")];

			case 2:
				return [
					this.renderPlayerSprite(sprites[0], "center", "top"),
					this.renderPlayerSprite(sprites[1], "center", "bottom")
				];

			default:
				return [
					this.renderPlayerSprite(sprites[0], "center", "top"),
					this.renderCollapsedSprite(players.slice(1), "center", "bottom")
				];
		}
	}

	renderBuildingIcon(placeIdx, buildingType, reactKey) {
		const isLeftRow = placeIdx > 10 && placeIdx < 20;
		const isRightRow = placeIdx > 30 && placeIdx < 49;
		const verticalClassName = (isLeftRow || isRightRow) ? "placed-house-vertical" : "";

		return <img key={reactKey} src={`/images/${buildingType}.svg`} className={`placed-house ${verticalClassName}`} />
	}

	renderJail(players, afterImages) {
		const inJail = this.renderPlayersForJail(players.filter(player => player.jailDays > 0));
		const justVisiting = this.renderPlayersForJustVisiting(players.filter(player => player.jailDays === 0), afterImages);

		return <div>
			<div id="jail">{inJail}</div>
			<div id="jail-vertical-walkway">{justVisiting.slice(0, JAIL_VERTICAL_WALKWAY_CAPACITY)}</div>
			<div id="jail-horizontal-walkway">{justVisiting.slice(JAIL_VERTICAL_WALKWAY_CAPACITY)}</div>
		</div>;
	}
	
	renderPlayersForJail(players) {
		if (players.length === 0) {
			return null;
		}

		if (players.length === 1) {
			return this.renderPlayerSprite([players[0], false], "center", "center", false);
		}

		return this.renderCollapsedSprite(players, "center", "center");
	}

	renderPlayersForJustVisiting(players, afterImages) {
		const justVisiting = [
			...players.map(player => ([player, false])),
			...afterImages.map(player => ([player, true]))
		];

		if (justVisiting.length <= 5) {
			return justVisiting.map(([player, isAfterImage]) => this.renderMiniPlayerSprite(player, isAfterImage));
		}

		return [
			...justVisiting.slice(0, 4).map(([player, isAfterImage]) => this.renderMiniPlayerSprite(player, isAfterImage)),
			this.renderCollapsedSprite(players.slice(4), "center", "center", true)
		]
	}

	renderMiniPlayerSprite(player, isAfterImage) {
		return this.renderPlayerSprite([player, isAfterImage], "center", "center", true);
	}

	renderPlayersHorizontally(players, afterImages) {
		const sprites = [
			...players.map(player => ([player, false])),
			...afterImages.map(afterImage => ([afterImage, false]))
		];

		switch (sprites.length) {
			case 0:
				return [];

			case 1:
				return [this.renderPlayerSprite(sprites[0], "center", "center")];

			case 2:
				return [
					this.renderPlayerSprite(sprites[0], "left", "center"),
					this.renderPlayerSprite(sprites[1], "right", "center")
				];

			default:
				return [
					this.renderPlayerSprite(sprites[0], "left", "center"),
					this.renderCollapsedSprite(players.slice(1), "right", "center")
				];
		}
	}

	render() {
		const {placeIdx, rowName, playersWithAfterImages, chemTrailSize, isHighlighted} = this.props;
		const place = PlaceConfigs[placeIdx];

		const squareStyle = {
			...this.getSquarePosition(rowName, placeIdx % 10),
			...this.getSquareBackground(place)
		};

		const additionalProps = (placeIdx == Locations.FreeParking) ? {id: "alltax"} : {};

		const chemTrailStyle = {
			width: `${chemTrailSize}px`,
			height: `${chemTrailSize}px`,
			marginLeft: `-${chemTrailSize/2}px`,
			marginTop: `-${chemTrailSize/2}px`
		};

		const nonResidentialHighlightedClass = (isHighlighted && (Railroads.includes(placeIdx) || Utilities.includes(placeIdx)))
			? "location-highlighted" : "";

		return <div key={placeIdx}
			dataset-no={placeIdx}
			style={squareStyle}
			className={`location ${rowName} ${nonResidentialHighlightedClass}`}
			onClick={() => this.props.onClickLocation(placeIdx)}
			{...additionalProps}>
				{this.renderSquareType(place, placeIdx, rowName)}
				<div className="chem-trail" style={chemTrailStyle}></div>
		</div>;
	}
}

function repeat(n, func) {
	return new Array(n).fill(null).map((_, i) => func(i));
}


GameBoardSquare.propTypes = {
	placeIdx: PropTypes.number,
	rowName: PropTypes.string,
	isHighlighted: PropTypes.bool,
	houseCount: PropTypes.number,
	players: PropTypes.arrayOf(PropTypes.instanceOf(Player)),
	afterImages: PropTypes.arrayOf(PropTypes.instanceOf(Player)),
	chemTrailSize: PropTypes.number,

	onClickLocation: PropTypes.func,
	onClickPlayer: PropTypes.func,
	onMouseOverPlayer: PropTypes.func
};

GameBoardSquare.defaultProps = {
	onClickLocation: () => {},
	onClickPlayer: () => {},
	onMouseOverPlayer: () => {}
}

export default GameBoardSquare;