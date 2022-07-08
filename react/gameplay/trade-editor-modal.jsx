import Modal from "/javascripts/common/modal/modal.js";
import Player from "/javascripts/common/models/player.js";
import {Place} from "/javascripts/common/models/place.js";
import TradeDetails from "/javascripts/gameplay/trade-details.js";
import TradePropertyList from "/javascripts/gameplay/trade-property-list.js";
import validate from "/javascripts/validate-props.js";


class TradeEditorModal extends React.Component {
	constructor(props) {
		validate(super(props));

		this.state = {
			selectedOfferId: "",
			toPlayerId: undefined,
			offerName: "",
			message: "",
			cash: 0,
			numJailCards: 0,
			fromProperties: [37, 39],
			toProperties: [1]
		};
	}

	handleClickOfferName(selectedOfferId) {
		this.setState({selectedOfferId});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// When offers appear: auto-select the first one.
		if (prevProps.tradeOffers.length === 0 && this.props.tradeOffers.length > 0 && prevState.selectedOfferId === undefined) {
			const firstTradeOffer = this.props.tradeOffers
				.sort((offerA, offerB) => (offerA.fromPlayerId === offerB.fromPlayerId) ? (offerA.createTime - offerB.createTime) : (offerA.fromPlayerId - offerB.fromPlayerId))[0];
			this.setState({selectedOfferId: firstTradeOffer.id});
		}
		// TODO: If offer gone, auto-select the new first one.

		// On load: initialize dropdown value to first player that's not you.
		if (prevProps.players.length === 0 && this.props.players.length > 1 && prevState.toPlayerId === undefined) {
			this.setState({toPlayerId: this.getFirstOtherPlayer().num});
		}
	}

	getFirstOtherPlayer() {
		return this.props.players.filter(player => player.num !== this.props.myPlayerId)[0];
	}

	handleChangeToPlayer(event) {
		this.setState({toPlayerId: +event.target.value});
	}

	handleChangeOfferName(event) {
		this.setState({offerName: event.target.value});
	}

	handleChangeMessage(event) {
		this.setState({message: event.target.value});
	}

	handleChangeCash(event) {
		this.setState({cash: +event.target.value});
	}

	handleChangeJailCards(event) {
		this.setState({numJailCards: +event.target.value});
	}

	handleClickSendOffer() {
		const {toPlayerId, offerName, message, cash, numJailCards, fromProperties, toProperties} = this.state;
		// TODO: Add fromProperties and toProperties
		if (toPlayerId !== undefined && offerName !== "") {
			this.props.onClickSendOffer({
				toPlayerId,
				name: offerName,
				message,
				cash,
				numJailCards,
				fromProperties,
				toProperties
			});
		}

		// Reset fields
		this.setState({
			toPlayerId: this.getFirstOtherPlayer().num,
			offerName: "",
			message: "",
			cash: 0,
			numJailCards: 0,
			fromProperties: [],
			toProperties: []
		});
	}

	render() {
		const tradeOffer = this.props.tradeOffers.find(offer => offer.id === this.state.selectedOfferId);

		return <Modal title=""
			isOpen={this.props.isOpen}
			onModalSlide={this.props.onModalSlide}
			onClickCloseModal={this.props.onCloseTrade}
			displayStyle="grid">
			<div id="trade-offer-picker">
				<div className="button" onClick={() => this.handleClickOfferName("")}>+ Create Offer</div>
				<div>
				{this.props.players.map(player => {
					const offersFromPlayer = this.props.tradeOffers.filter(offer => offer.fromPlayerId === player.num);
					if (offersFromPlayer.length === 0) {
						return null;
					}

					return <div key={player.num}>
						<div className="trade-offer-player-name">{player.name}</div>
						{offersFromPlayer.map(offer => {
							const offerSelectedClass = (offer.id === this.state.selectedOfferId) ? "selected" : "";
							return <div className={`trade-offer-name ${offerSelectedClass}`}
								key={offer.id}
								onClick={() => this.handleClickOfferName(offer.id)}>
								{offer.name}
							</div>;
						})}
					</div>;
				})}
				</div>
			</div>

			{/* Serve offer editor */}
			{tradeOffer === undefined && <div style={{gridRow: 2, display: "grid", marginLeft: "20px"}}>
				<div style={{gridRow: 1, gridColumn: 1}}>
					<div className="label">Offer name</div>
					<input type="text" onChange={this.handleChangeOfferName.bind(this)} value={this.state.offerName} />
				</div>
				<div style={{gridRow: 2, gridColumn: 1}}>
					<div className="label">Message</div>
					<textarea onChange={this.handleChangeMessage.bind(this)} value={this.state.message} />
				</div>
				<div style={{gridRow: 1, gridColumn: 2}}>
					<div className="label">Cash to send</div>
					<input type="number" onChange={this.handleChangeCash.bind(this)} value={this.state.cash} />
				</div>
				<div style={{gridRow: 2, gridColumn: 2}}>
					<div className="label"># of jail cards to send</div>
					<input type="number" onChange={this.handleChangeJailCards.bind(this)} value={this.state.numJailCards} />
				</div>
				<div style={{gridRow: 1, gridColumn: 3}}>
					<div className="button inline" onClick={this.handleClickSendOffer.bind(this)} style={{gridRow: 1, gridColumn: 3}}>Send Offer</div>
				</div>
			</div>}
			{tradeOffer === undefined && <div style={{gridRow: 3}} id="property-list-container">
				<div className="property-list-header">You</div>
				<div className="property-list-underbar"></div>
				<TradePropertyList
					cash={0}
					numJailCards={0}
					properties={this.props.places.filter(place => place.ownerNum === this.props.myPlayerId).map(place => place.placeIdx)}
					places={this.props.places} />
				{this.props.players[this.state.toPlayerId] && <div className="property-list-header">
					<select onChange={this.handleChangeToPlayer.bind(this)} value={this.state.toPlayerId}>
					{this.props.players
						.filter(player => player.num !== this.props.myPlayerId)
						.map(player => <option value={player.num} key={player.num}>{player.name}</option>)}</select>
				</div>}
				<div className="property-list-underbar"></div>
				<TradePropertyList
					cash={0}
					numJailCards={0}
					properties={this.props.places.filter(place => place.ownerNum === this.state.toPlayerId).map(place => place.placeIdx)}
					places={this.props.places} />
			</div>}

			{/* Display selected offer's details */}
			{tradeOffer !== undefined && <TradeDetails
				fromPlayerName={this.props.players[tradeOffer.fromPlayerId].name}
				offerMessage={tradeOffer.message}
				offerCreateTime={tradeOffer.createTime}
				onClickAcceptOffer={() => this.props.onClickAcceptOffer(tradeOffer.id)}
				onClickDeclineOffer={() => this.props.onClickDeclineOffer(tradeOffer.id)}
				/>}
			{tradeOffer !== undefined && <div style={{gridRow: 3}} id="property-list-container">
				<div className="property-list-header">You</div>
				<div className="property-list-underbar"></div>
				<TradePropertyList
					cash={-tradeOffer.cash}
					numJailCards={-tradeOffer.numJailCards}
					properties={tradeOffer.toProperties}
					places={this.props.places} />
				<div className="property-list-header">{this.props.players[tradeOffer.fromPlayerId].name}</div>
				<div className="property-list-underbar"></div>
				<TradePropertyList
					cash={tradeOffer.cash}
					numJailCards={tradeOffer.numJailCards}
					properties={tradeOffer.fromProperties}
					places={this.props.places} />
			</div>}

		</Modal>
	}
}

TradeEditorModal.propTypes = {
	isOpen: PropTypes.bool,
	onModalSlide: PropTypes.func,
	onCloseTrade: PropTypes.func,
	players: PropTypes.arrayOf(PropTypes.instanceOf(Player)),
	places: PropTypes.arrayOf(PropTypes.instanceOf(Place)),
	tradeOffers: PropTypes.arrayOf(PropTypes.shape({
		// TODO: Finish
		id: PropTypes.string
	})),
	myPlayerId: PropTypes.number,
	onClickAcceptOffer: PropTypes.func,
	onClickDeclineOffer: PropTypes.func,
	onClickSendOffer: PropTypes.func
};

export default TradeEditorModal;