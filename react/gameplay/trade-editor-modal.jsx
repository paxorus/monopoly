import Modal from "/javascripts/common/modal/modal.js";
import Player from "/javascripts/common/models/player.js";
import AgeToTextHelper from "/javascripts/common/friendliness/age-to-text-helper.js";
import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import validate from "/javascripts/validate-props.js";

// <div className="button inline" onClick={this.props.onClickSendOffer}>Send Offer</div>

class TradeEditorModal extends React.Component {
	constructor(props) {
		validate(super(props));

		this.state = {
			selectedOfferId: ""
		};
	}

	handleClickOfferName(selectedOfferId) {
		this.setState({selectedOfferId});
	}

	renderDetails() {
		const tradeOffer = this.props.tradeOffers.find(offer => offer.id === this.state.selectedOfferId);
		if (tradeOffer === undefined) {
			return null;
		}

		return [
			<div style={{gridRow: 2, display: "grid"}} key="details">
				<div>
					<div className="label">From</div>
					{this.props.players[tradeOffer.fromPlayerId].name}
				</div>
				<div title={new Date(tradeOffer.createTime).toLocaleString()} style={{gridColumn: 1}}>
					<div className="label">Received</div>
					{AgeToTextHelper.describeTimeSince(tradeOffer.createTime)}
				</div>
				<div style={{gridRow: "1 / span 2", gridColumn: 2}}>
					<div className="label">Message</div>
					{tradeOffer.message}
				</div>
				<div style={{gridRow: "1 / span 2", gridColumn: 3}}>
					<div className="vertical-align">
						<div className="button" onClick={() => this.props.onClickAcceptOffer(tradeOffer.id)}>Accept Offer</div>
						<div style={{height: "10px"}}></div>
						<div className="button-secondary" onClick={() => this.props.onClickDeclineOffer(tradeOffer.id)}>Decline Offer</div>
					</div>
				</div>
			</div>,
			<div style={{gridRow: 3}} id="property-list-container" key="properties">
				<div>
					<div className="property-list-header">You</div>
					<div className="property-list-underbar"></div>
					<div className="property-list">
						{tradeOffer.toProperties.map(placeIdx =>
							<div className="offer-property" key={placeIdx}>{PlaceConfigs[placeIdx].name}</div>
						)}
					</div>
				</div>
				<div>
					<div className="property-list-header">{this.props.players[tradeOffer.fromPlayerId].name}</div>
					<div className="property-list-underbar"></div>
					<div className="property-list">
						{tradeOffer.fromProperties.map(placeIdx =>
							<div className="offer-property" key={placeIdx}>{PlaceConfigs[placeIdx].name}</div>
						)}
						<div className="offer-property">Cash: {tradeOffer.cash}</div>
						<div className="offer-property">Jail cards: {tradeOffer.numJailCards}</div>
					</div>
				</div>
			</div>
		];
	}

	render() {
		return <Modal title=""
			isOpen={this.props.isOpen}
			onModalSlide={this.props.onModalSlide}
			onClickCloseModal={this.props.onCloseTrade}
			displayStyle="grid">
			<div className="inline" id="trade-offer-picker">
				<div className="button" onClick={()=>{}}>+ Create Offer</div>
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
			{this.renderDetails()}
		</Modal>
	}
}

TradeEditorModal.propTypes = {
	isOpen: PropTypes.bool,
	onModalSlide: PropTypes.func,
	onCloseTrade: PropTypes.func,
	players: PropTypes.arrayOf(PropTypes.instanceOf(Player)),
	tradeOffers: PropTypes.arrayOf(PropTypes.shape({
		// TODO: Finish
		id: PropTypes.string
	})),
	onClickAcceptOffer: PropTypes.func,
	onClickDeclineOffer: PropTypes.func,
	onClickSendOffer: PropTypes.func
};

export default TradeEditorModal;