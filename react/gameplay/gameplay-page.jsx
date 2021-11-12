import {PlaceConfigs, propertyComparator, Locations} from "/javascripts/gameplay/location-configs.js";
import LocationCard from "/javascripts/gameplay/location-card.js";
import GameBoard from "/javascripts/common/game-board.js";
import Player from "/javascripts/gameplay/player.js";
import PlayerDashboard from "/javascripts/gameplay/player-dashboard.js";
import validate from "/javascripts/validate-props.js";


class GameplayPage extends React.Component {
	constructor(props) {
		validate(super(props));

		const socket = io("/gameplay");
		window.socket = socket;

		socket.on("start-up", this.startUp.bind(this));

		// // Updates
		// socket.on("dialog", text => log(text));
		// socket.on("notify", text => log(text));

		// socket.on("update-balance", ({playerId, balance}) => {
		// 	GlobalState.players[playerId].updateBalance(balance);
		// });

		// socket.on("update-location", ({playerId, placeIdx}) => {
		// 	GlobalState.players[playerId].updateLocation(placeIdx);
		// });

		// // Turn actions
		// socket.on("allow-conclude-turn", () => {
		// 	allowConcludeTurn();
		// });

		// socket.on("advance-turn", ({nextPlayerId}) => {
		// 	updateTurn(nextPlayerId);
		// });

		// // Property actions
		// socket.on("offer-unowned-property", ({placeIdx}) => {
		// 	offerUnownedProperty(GlobalState.me, placeIdx);
		// });

		// socket.on("purchase-property", ({playerId, placeIdx}) => {
		// 	purchaseProperty(GlobalState.players[playerId], placeIdx);
		// });

		// socket.on("build-house-buttons", ({placeIdx}) => {
		// 	buildHouseButtons(placeIdx);
		// });

		// socket.on("buy-house", ({playerId, placeIdx}) => {
		// 	buyHouse(GlobalState.players[playerId], placeIdx);
		// });

		// socket.on("sell-house", ({playerId, placeIdx}) => {
		// 	sellHouse(GlobalState.players[playerId], placeIdx);
		// });

		// // Jail actions
		// socket.on("go-to-jail", ({playerId}) => {
		// 	GlobalState.players[playerId].goToJail();
		// });

		// socket.on("get-out-of-jail", ({playerId}) => {
		// 	GlobalState.players[playerId].getOutOfJail();
		// });

		// socket.on("add-jail-card", ({playerId}) => {
		// 	addGetOutOfJailFreeCard(GlobalState.players[playerId]);
		// });

		// socket.on("use-jail-card", ({playerId}) => {
		// 	updateGetOutOfJailFreeCards(GlobalState.players[playerId]);
		// });

		// socket.on("update-jail-days", ({playerId, jailDays}) => {
		// 	GlobalState.players[playerId].updateJailDays(jailDays);
		// });

		// socket.on("offer-pay-out-of-jail", () => {
		// 	offerPayOutOfJail();
		// });

		// // Tax actions
		// socket.on("update-tax", ({tax}) => {
		// 	GlobalState.tax = tax;
		// });

		// // Mortgage actions
		// socket.on("mortgage-property", ({playerId, placeIdx}) => {
		// 	mortgageProperty(GlobalState.players[playerId], placeIdx);
		// });

		// socket.on("unmortgage-property", ({playerId, placeIdx}) => {
		// 	unmortgageProperty(GlobalState.players[playerId], placeIdx);
		// });

		socket.emit("start-up", {gameId: props.gameId});
		this.socket = socket;

		this.state = {
			players: [],
			places: [],
			selectedPlaceIdx: -1,
			highlightedProperties: new Set(),
			isDashboardOpen: {},
			me: null
		};
	}

	startUp({playerData, locationData, monopolies, yourPlayerId, currentPlayerId, tax, numTurns}) {
		// Handle: monopolies, currentPlayerId, numTurns
		const players = playerData.map(({name, num, spriteFileName, balance, placeIdx}) => {
			// TODO: Move to player.js.
			const player = new Player(name, num, spriteFileName);
			player.balance = balance;
			player.placeIdx = placeIdx;
			return player;
		});

		const locationDataByIdx = Object.fromEntries(locationData
			.map(({placeIdx, ownerNum, houseCount, isMortgaged}) => [placeIdx, {ownerNum, houseCount, isMortgaged}]));
		const places = PlaceConfigs.map((placeConfig, placeIdx) => {
			if (placeIdx in locationDataByIdx) {
				return {
					...placeConfig,
					...locationDataByIdx[placeIdx],
					placeIdx
				}
			}

			return {
				...placeConfig,
				placeIdx,
				ownerNum: -1,
				houseCount: 0,
				isMortgaged: false
			}
		});

		const isDashboardOpen = Object.fromEntries(players.map(({num}) => [num, false]));
		isDashboardOpen[yourPlayerId] = true;

		this.setState({
			players,
			places,
			me: players[yourPlayerId],
			tax,
			isDashboardOpen
		});
	}

	/**
	 * Close location card.
	 */
	handleClickCloseLocationCard() {
		this.setState({selectedPlaceIdx: -1});
	}

	/**
	 * Open player dashboard.
	 */
	openDashboard(playerNum) {
		this.setState(state => ({
			isDashboardOpen: {
				...state.isDashboardOpen,
				[playerNum]: !state.isDashboardOpen[playerNum]
			}
		}));
	}

	/**
	 * Open location card.
	 */
	handleClickLocation(selectedPlaceIdx) {
		this.setState({selectedPlaceIdx});
	}

	/**
	 * Highlight properties.
	 */
	handleMouseOverProperty(placeIdx, overOrOut) {
		this.setState(state => {
			if (!overOrOut) {
				return {highlightedProperties: new Set()};
			}

			return {highlightedProperties: new Set([placeIdx])}
		});
	}

	highlightProperties(playerNum, overOrOut) {
		this.setState(state => {
			if (!overOrOut || playerNum === -1) {
				return {highlightedProperties: new Set()};
			}
			const highlightedProperties = state.places
				.filter(place => place.ownerNum === playerNum)
				.map(place => place.placeIdx);

			return {highlightedProperties: new Set(highlightedProperties)};			
		});
	}

	getSelectedPlaceOwnerNum() {
		if (this.state.selectedPlaceIdx === -1) {
			return -1;
		}
		const place = this.state.places[this.state.selectedPlaceIdx];
		return place.ownerNum;		
	}

	getSelectedPlaceOwnerName() {
		const ownerNum = this.getSelectedPlaceOwnerNum();
		return (ownerNum === -1) ? "-unowned-" : this.state.players[ownerNum].name;
	}

	getIsDashboardOpen(playerNum) {
		return this.state.isDashboardOpen[playerNum];
	}

	getProperties(playerNum) {
		return this.state.places
			.filter(place => place.ownerNum === playerNum)
			.sort((place1, place2) => propertyComparator(place1.placeIdx, place2.placeIdx));
	}

	render() {
		return <div>

			<GameBoard
				players={this.state.players.map(({num, spriteFileName, placeIdx, jailDays}) => ({num, spriteFileName, placeIdx, jailDays}))}
				onClickLocation={this.handleClickLocation.bind(this)}
				onClickPlayer={this.openDashboard.bind(this)}
				onMouseOverPlayer={this.highlightProperties.bind(this)}
				highlightedPlaces={this.state.highlightedProperties} />

			<LocationCard placeIdx={this.state.selectedPlaceIdx}
				ownerName={this.getSelectedPlaceOwnerName()}
				tax={this.state.tax}
				onClickClose={this.handleClickCloseLocationCard.bind(this)}
				onClickOwner={() => this.openDashboard(this.getSelectedPlaceOwnerNum())}
				onMouseOverOwner={overOrOut => this.highlightProperties(this.getSelectedPlaceOwnerNum(), overOrOut)} />

			<div id="initial-interactive" className="interactive" style={{display: "none"}}>
				You will go first.
				<div className="button" onClick={this.executeTurn}>Start Game</div>
			</div>

			<div id="waiting-on-player" className="interactive" style={{display: "none"}}>
				It's <span id="current-player-name"></span>'s turn.
			</div>

			<div id="interactive" className="interactive">
				<div className="button" onClick={this.executeTurn} id="execute-turn" style={{display: "none"}}>Take Your Turn</div>
				<div id="message-box">
				</div>
				<div id="button-box">
				</div>
				<div className="button" onClick={this.executeTurn} id="end-turn" style={{display: "none"}}>End Turn</div>
				{/* <br /> */}
				{/* <div className="button" onClick="trade()">Trade</div> */}
			</div>

			{/* Player HUDs */}
			<div id="heads">
				{this.state.players.map(player => <PlayerDashboard
					key={player.num}
					isOpen={this.getIsDashboardOpen(player.num)}
					isMe={player === this.state.me}
					player={player}
					properties={this.getProperties(player.num)}
					onClickHeader={this.openDashboard.bind(this)}
					onClickProperty={this.handleClickLocation.bind(this)}
					onMouseOverProperty={this.handleMouseOverProperty.bind(this)} />)}
			</div>
		</div>
	}
}

GameplayPage.propTypes = {
	gameId: PropTypes.string
};

function render(props, domElement) {
	ReactDOM.render(<GameplayPage {...props} />, domElement);
}

export {
	render
};