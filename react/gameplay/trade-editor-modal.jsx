import Modal from "/javascripts/common/modal/modal.js";
import Player from "/javascripts/common/models/player.js";
import {Place} from "/javascripts/common/models/place.js";
import TradeDetails from "/javascripts/gameplay/trade-details.js";
import TradePropertyList from "/javascripts/gameplay/trade-property-list.js";
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

	render() {
		const tradeOffer = this.props.tradeOffers.find(offer => offer.id === this.state.selectedOfferId);

		return <Modal title=""
			isOpen={this.props.isOpen}
			onModalSlide={this.props.onModalSlide}
			onClickCloseModal={this.props.onCloseTrade}
			displayStyle="grid">
			<div id="trade-offer-picker">
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
	onClickAcceptOffer: PropTypes.func,
	onClickDeclineOffer: PropTypes.func,
	onClickSendOffer: PropTypes.func
};

export default TradeEditorModal;