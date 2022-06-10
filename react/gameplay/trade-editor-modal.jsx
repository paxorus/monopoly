import Modal from "/javascripts/common/modal/modal.js";
import Player from "/javascripts/common/models/player.js";
import validate from "/javascripts/validate-props.js";


class TradeEditorModal extends React.Component {
	constructor(props) {
		validate(super(props));
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
						{offersFromPlayer.map(offer => <div className="trade-offer-name" key={offer.id}>{offer.name}</div>)}
					</div>;
				})}
				</div>
			</div>
			<div className="button inline" onClick={this.props.onClickSendOffer}>Send Offer</div>
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
	onClickSendOffer: PropTypes.func
};

export default TradeEditorModal;