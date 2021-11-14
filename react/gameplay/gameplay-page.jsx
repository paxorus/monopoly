import {PlaceConfigs, propertyComparator, Locations} from "/javascripts/gameplay/location-configs.js";
import LocationCard from "/javascripts/gameplay/location-card.js";
import GameBoard from "/javascripts/common/game-board.js";
import MessageBox from "/javascripts/gameplay/message-box.js";
import Player from "/javascripts/gameplay/player.js";
import PlayerDashboard from "/javascripts/gameplay/player-dashboard.js";
import validate from "/javascripts/validate-props.js";


class GameplayPage extends React.Component {
	constructor(props) {
		validate(super(props));

		const socket = io("/gameplay");
		window.socket = socket;

		socket.on("start-up", this.startUp.bind(this));
		socket.on("game-action", (message) => {
			console.log("here", message);
			this.setState(state => ({
				messages: [...state.messages, message]
			}));
		});

		socket.emit("start-up", {gameId: props.gameId});
		this.socket = socket;

		this.state = {
			players: [],
			places: [],
			selectedPlaceIdx: -1,
			highlightedProperties: new Set(),
			isDashboardOpen: {},
			me: null,
			monopolies: [],
			messages: [],
			myPlayerId: -1,
			waitingForServer: false
			// showStartGame: false,
			// waitingOnPlayer: "-null-player-"
		};
	}

	startUp({playerData, locationData, monopolies, yourPlayerId, currentPlayerId, tax, numTurns}) {
		// Handle: currentPlayerId, numTurns
		const players = playerData.map(({name, num, spriteFileName, balance, placeIdx}) => {
			// TODO: Move to player.js.
			const player = new Player(name, num, spriteFileName);
			player.balance = balance;
			player.placeIdx = placeIdx;
			return player;
		});

		const places = this.hydratePlaces(locationData);

		const isDashboardOpen = Object.fromEntries(players.map(({num}) => [num, false]));
		isDashboardOpen[yourPlayerId] = true;

		this.setState({
			players,
			places,
			me: players[yourPlayerId],
			tax,
			isDashboardOpen,
			monopolies,
			numTurns,
			currentPlayerId,
			myPlayerId: yourPlayerId,
			messages: playerData[yourPlayerId].savedMessages
		});
	}

	executeTurn() {
		this.socket.emit("execute-turn");
	}

	concludeTurn() {
		this.socket.emit("advance-turn")
	}

	respondToBuyOffer(ifBuy) {
		// Hide the Buy/No buttons.
		// $("#button-box").children().remove();
		this.setState({waitingForServer: true});
		socket.emit("respond-to-buy-offer", {ifBuy});
	}


	offerUnownedProperty(mover, placeIdx) {
		// const place = places[placeIdx];
		// log(mover.name + ", would you like to buy " + place.name + " for $" + place.price + "?");
		// $("#button-box").append("<div class='button' onclick='respondToBuyOffer(true)'>Buy " + place.name + "</div>");
		// $("#button-box").append("<div class='button-negative' onclick='respondToBuyOffer(false)'>No Thanks</div>");
	}

	hydratePlaces(locationData) {
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

		return places;	
	}

	logMessage(message) {
		this.setState(state => {
			messages: [...state.messages, message]
		});
	}

	clearMessages(message) {
		this.setState({messages: []});
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
				places={this.state.places}
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

			{(this.state.currentPlayerId !== undefined) &&
				<MessageBox messages={this.state.messages}
					numTurns={this.state.numTurns}
					currentPlayerId={this.state.currentPlayerId}
					myPlayerId={this.state.myPlayerId}
					players={this.state.players}
					waitingForServer={this.state.waitingForServer}
					executeTurn={this.executeTurn.bind(this)}
					concludeTurn={this.concludeTurn.bind(this)}
					respondToBuyOffer={this.respondToBuyOffer.bind(this)} />}

			{/* Player Dashboards */}
			<div id="heads">
				{this.state.players.map(player => <PlayerDashboard
					key={player.num}
					isOpen={this.getIsDashboardOpen(player.num)}
					isMe={player === this.state.me}
					player={player}
					myMonopolies={new Set(this.state.monopolies.flatMap(monopoly => monopoly))}
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