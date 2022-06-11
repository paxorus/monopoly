import Modal from "/javascripts/common/modal/modal.js";
import Player from "/javascripts/common/models/player.js";
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

		return <div className="inline" style={{width: "500px"}}>
			<div>From: {this.props.players[tradeOffer.fromPlayerId].name}</div>
			<div>Received: {tradeOffer.createTime}</div>
			<div>Message: {tradeOffer.message}</div>

			<div>To do: {JSON.stringify([tradeOffer.fromProperties, tradeOffer.toProperties, tradeOffer.cash, tradeOffer.numJailCards])}</div>

			<div className="button inline" onClick={() => this.props.onClickAcceptOffer(tradeOffer.id)}>Accept Offer</div>
			<div className="button-secondary inline" onClick={() => this.props.onClickDeclineOffer(tradeOffer.id)}>Decline Offer</div>
		</div>
	}

	render() {
		return <Modal title=""
			isOpen={this.props.isOpen}
			onModalSlide={this.props.onModalSlide}
			onClickCloseModal={this.props.onCloseTrade}>
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