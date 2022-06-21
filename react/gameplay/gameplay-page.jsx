import {PlaceConfigs, propertyComparator, Locations} from "/javascripts/gameplay/location-configs.js";
import LocationCard from "/javascripts/gameplay/location-card.js";
import GameBoard from "/javascripts/common/game-board/game-board.js";
import {hydratePlaces} from "/javascripts/common/models/place.js";
import MessageBox from "/javascripts/gameplay/message-box.js";
import Player from "/javascripts/common/models/player.js";
import PlayerDashboard from "/javascripts/gameplay/player-dashboard.js";
import TradeEditorModal from "/javascripts/gameplay/trade-editor-modal.js";
import ModalPage from "/javascripts/common/modal/modal-page.js";
import validate from "/javascripts/validate-props.js";

class GameplayPage extends React.Component {
	constructor(props) {
		validate(super(props));

		const socket = io("/gameplay");
		window.socket = socket;

		socket.on("start-up", this.startUp.bind(this));

		// Updates
		socket.on("dialog", text => this.logMessage("dialog", text));
		socket.on("notify", text => this.logMessage("notify", text));

		socket.on("update-balance", ({playerId, balance}) => {
			this.updatePlayer(playerId, {balance});
		});

		socket.on("update-location", ({playerId, placeIdx}) => {
			this.updatePlayer(playerId, {placeIdx});
		});

		// Turn actions
		socket.on("allow-conclude-turn", () => {
			this.logMessage("allow-conclude-turn", null);
		});

		socket.on("advance-turn", ({nextPlayerId}) => {
			this.setState({currentPlayerId: nextPlayerId});
			this.clearMessages();
			this.logMessage("advance-turn", {nextPlayerId});
		});

		// Property actions
		socket.on("offer-unowned-property", ({placeIdx}) => {
			this.logMessage("offer-unowned-property", {placeIdx});
		});

		socket.on("purchase-property", ({playerId, placeIdx}) => {
			this.updatePlace(placeIdx, {ownerNum: playerId});
		});

		socket.on("update-property-owner", ({playerId, placeIdx}) => {
			this.updatePlace(placeIdx, {ownerNum: playerId});
		});

		socket.on("buy-house", ({playerId, placeIdx}) => {
			this.updatePlace(placeIdx, place => ({houseCount: place.houseCount + 1}));
		});

		socket.on("sell-house", ({playerId, placeIdx}) => {
			this.updatePlace(placeIdx, place => ({houseCount: place.houseCount - 1}));
		});

		// Jail actions
		socket.on("go-to-jail", ({playerId}) => {
			this.updatePlayer(playerId, {jailDays: 3});
		});

		socket.on("get-out-of-jail", ({playerId}) => {
			this.updatePlayer(playerId, {jailDays: 0});
		});

		socket.on("add-jail-card", ({playerId}) => {
			this.updatePlayer(playerId, player => ({numJailCards: player.numJailCards + 1}));
		});

		socket.on("use-jail-card", ({playerId}) => {
			this.updatePlayer(playerId, player => ({numJailCards: player.numJailCards - 1}));
		});

		socket.on("update-jail-days", ({playerId, jailDays}) => {
			this.updatePlayer(playerId, {jailDays});
		});

		socket.on("offer-pay-out-of-jail", () => {
			this.logMessage("offer-pay-out-of-jail", null);
		});

		// Tax actions
		socket.on("update-tax", ({tax}) => {
			this.setState({tax});
		});

		// Mortgage actions
		socket.on("mortgage-property", ({playerId, placeIdx}) => {
			this.updatePlace(placeIdx, {isMortgaged: true});
		});

		socket.on("unmortgage-property", ({playerId, placeIdx}) => {
			this.updatePlace(placeIdx, {isMortgaged: false});
		});

		// Trade actions
		socket.on("send-trade-offer", ({trade}) => {
			this.setState(state => ({tradeOffers: [
				...state.tradeOffers,
				trade
			]}));
		});

		socket.on("accept-trade-offer", ({tradeId}) => {
			this.setState({tradeOffers: this.state.tradeOffers.filter(tradeOffer => tradeOffer.id !== tradeId)});
		});

		socket.on("decline-trade-offer", ({tradeId}) => {
			this.setState({tradeOffers: this.state.tradeOffers.filter(tradeOffer => tradeOffer.id !== tradeId)});
		});

		// Start up!
		socket.emit("start-up", {gameId: props.gameId});
		this.socket = socket;

		this.state = {
			// Initialized by server
			gameName: "(loading)",
			players: [],
			places: [],
			me: null,
			monopolies: [],
			messages: [],
			myPlayerId: -1,
			isDashboardOpen: {},
			tradeOffers: [],

			// React-related
			selectedPlaceIdx: -1,
			highlightedProperties: new Set(),
			isTradeEditorOpen: false
		};
	}

	updatePlayer(index, deltaObjectOrFunc) {
		this.setState(state => {
			const arrayCopy = [...state.players];
			arrayCopy[index] = arrayCopy[index].update(deltaObjectOrFunc);
			return {players: arrayCopy};
		});
	}

	updatePlace(index, deltaObjectOrFunc) {
		this.setState(state => {
			const arrayCopy = [...state.places];
			arrayCopy[index] = arrayCopy[index].update(deltaObjectOrFunc);
			return {places: arrayCopy};
		});
	}

	startUp({gameName, playerData, locationData, monopolies, yourPlayerId, currentPlayerId, tax, numTurns, tradeOffers}) {
		const players = playerData.map(({name, num, spriteFileName, borderColor, balance, placeIdx, jailDays, numJailCards}) => {
			// TODO: Move to player.js.
			const player = new Player(name, num, spriteFileName, borderColor);
			player.balance = balance;
			player.placeIdx = placeIdx;
			player.jailDays = jailDays;
			player.numJailCards = numJailCards;
			return player;
		});

		const places = hydratePlaces(locationData);

		const isDashboardOpen = Object.fromEntries(players.map(({num}) => [num, false]));
		isDashboardOpen[yourPlayerId] = true;

		this.setState({
			gameName,
			players,
			places,
			tax,
			isDashboardOpen,
			monopolies,
			numTurns,
			tradeOffers,
			currentPlayerId,
			myPlayerId: yourPlayerId,
			messages: playerData[yourPlayerId].savedMessages
		});
	}

	executeTurn() {
		this.logMessage("waiting-on-server");
		this.socket.emit("execute-turn");
	}

	concludeTurn() {
		this.logMessage("waiting-on-server");
		this.socket.emit("advance-turn");
	}

	respondToBuyOffer(ifBuy) {
		this.logMessage("waiting-on-server");
		this.socket.emit("respond-to-buy-offer", {ifBuy});
	}

	respondPayOutOfJail(hasAgreed) {
		if (hasAgreed) {
			this.logMessage("waiting-on-server");
			socket.emit("pay-out-of-jail");
		} else {
			this.logMessage("allow-conclude-turn");
		}
	}

	logMessage(eventName, eventData) {
		console.log(eventName, eventData);
		this.setState(state => ({
			messages: [...state.messages, [eventName, eventData]]
		}));
	}

	clearMessages() {
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

	handleBuyHouse(placeIdx) {
		this.logMessage("waiting-on-server");
		this.socket.emit("buy-house", {placeIdx});
	}

	handleSellHouse(placeIdx) {
		this.logMessage("waiting-on-server");
		this.socket.emit("sell-house", {placeIdx});
	}

	handleMortgageProperty(placeIdx, isMortgaged) {
		this.logMessage("waiting-on-server");
		if (isMortgaged) {
			this.socket.emit("unmortgage-property", {placeIdx});
		} else {
			this.socket.emit("mortgage-property", {placeIdx});
		}
	}

	handleUseJailCard() {
		this.logMessage("waiting-on-server");
		this.socket.emit("use-jail-card");
	}

	handleClickSendOffer(tradeOfferData) {
		this.logMessage("waiting-on-server");
		this.socket.emit("send-trade-offer", {trade: tradeOfferData});
	}

	handleClickAcceptOffer(tradeId) {
		this.socket.emit("accept-trade-offer", {tradeId});
	}

	handleClickDeclineOffer(tradeId) {
		this.socket.emit("decline-trade-offer", {tradeId});
	}

	handleClickTrade() {
		this.setState({
			isTradeEditorOpen: true
		});
	}

	handleCloseTrade() {
		this.setState({
			isTradeEditorOpen: false
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

	renderTradeModal(handleModalSlide) {
		return <TradeEditorModal
			key="trade"
			isOpen={this.state.isTradeEditorOpen}
			onCloseTrade={this.handleCloseTrade.bind(this)}
			onModalSlide={handleModalSlide}
			places={this.state.places}
			players={this.state.players}
			tradeOffers={this.state.tradeOffers}
			myPlayerId={this.state.myPlayerId}
			onClickAcceptOffer={this.handleClickAcceptOffer.bind(this)}
			onClickDeclineOffer={this.handleClickDeclineOffer.bind(this)}
			onClickSendOffer={this.handleClickSendOffer.bind(this)} />
	}

	render() {
		return <ModalPage modals={[{
			isOpen: this.state.isTradeEditorOpen,
			onClose: this.handleCloseTrade.bind(this),
			build: this.renderTradeModal.bind(this)
		}]}>

			<div id="page-header">
				<a href="/" id="home-link">Web Monopoly</a>
				<div id="game-name">{this.state.gameName}</div>
			</div>

			<GameBoard
				players={this.state.players}
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
				<div id="action-center">
					<div className="has-underbar">
						<div className="button" onClick={this.handleClickTrade.bind(this)}>Trade</div>
					</div>
					<MessageBox messages={this.state.messages}
						numTurns={this.state.numTurns}
						currentPlayerId={this.state.currentPlayerId}
						myPlayerId={this.state.myPlayerId}
						players={this.state.players}
						waitingForServer={this.state.waitingForServer}
						executeTurn={this.executeTurn.bind(this)}
						concludeTurn={this.concludeTurn.bind(this)}
						respondToBuyOffer={this.respondToBuyOffer.bind(this)}
						respondPayOutOfJail={this.respondPayOutOfJail.bind(this)}
						clearMessages={this.clearMessages.bind(this)} />
				</div>}

			{/* Player Dashboards */}
			<div id="player-dashboard-container">
				{this.state.players.map(player => <PlayerDashboard
					key={player.num}
					isOpen={this.getIsDashboardOpen(player.num)}
					isMe={player.num === this.state.myPlayerId}
					player={player}
					myMonopolies={new Set(this.state.monopolies.flatMap(monopoly => monopoly))}
					properties={this.getProperties(player.num)}
					onClickHeader={this.openDashboard.bind(this)}
					onClickProperty={this.handleClickLocation.bind(this)}
					onMouseOverProperty={this.handleMouseOverProperty.bind(this)}
					onClickBuyHouse={this.handleBuyHouse.bind(this)}
					onClickSellHouse={this.handleSellHouse.bind(this)}
					onClickMortgage={this.handleMortgageProperty.bind(this)}
					onClickUseJailCard={this.handleUseJailCard.bind(this)} />)}
			</div>
		</ModalPage>
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