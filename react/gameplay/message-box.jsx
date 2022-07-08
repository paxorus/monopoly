import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import Player from "/javascripts/common/models/player.js";
import validate from "/javascripts/validate-props.js";


class MessageBox extends React.Component {
	constructor(props) {
		validate(super(props));

		// TODO: Display other users' actions.
	}

	renderMessages() {
		return this.props.messages
			.filter(([eventName, message]) => eventName === "dialog" || eventName === "notify")
			.map(([eventName, message], i) => <div key={i}>{message}</div>);
	}

	renderCtaButton(interactions) {
		// If the last message was a call-to-action, repeat it. There is at least
		// one saved message if a player has clicked "Start Game", which is the
		// initial "advance-turn" message indicating the previous player has gone.

		if (interactions.length === 0) {
			return null;
		}

		const [finalEventName, finalMessage] = interactions[interactions.length - 1];
		switch (finalEventName) {
			// Offers
			case "allow-conclude-turn":
				return <div className="button" onClick={this.props.concludeTurn} id="end-turn">End Turn</div>;

			case "offer-pay-out-of-jail":
				const me = this.props.players[this.props.myPlayerId];
				const plural = (me.jailDays > 1) ? "s" : "";
				return <div>
					<div>{`No double... ${me.name}, you have ${me.jailDays} turn${plural} remaining on your sentence.`}</div>
					<div>{`${me.name}, would you like to pay $50 to get out of jail?`}</div>
					<div className="button" onClick={() => this.props.respondPayOutOfJail(true)}>Pay $50</div>
					<div className="button-negative" onClick={() => this.props.respondPayOutOfJail(false)}>No Thanks</div>
				</div>;

			case "offer-unowned-property":
				const place = PlaceConfigs[finalMessage.placeIdx];
				const myName = this.props.players[this.props.myPlayerId].name;
				const enabledClass = this.props.waitingForServer ? "button-disabled" : "";
				return <div>
					<div>{`${myName}, would you like to buy ${place.name} for $${place.price}?`}</div>
					<div className={`button ${enabledClass}`} onClick={() => this.props.respondToBuyOffer(true)}>{`Buy ${place.name}`}</div>
					<div className={`button-negative ${enabledClass}`} onClick={() => this.props.respondToBuyOffer(false)}>No Thanks</div>
				</div>;

			case "advance-turn":
				// Display whose turn it is.
				if (finalMessage.nextPlayerId === this.props.myPlayerId) {
					return <div className="button" onClick={this.props.executeTurn}>Take Your Turn</div>;
				} else {
					return <div>{`It's ${this.props.players[finalMessage.nextPlayerId].name}'s turn.`}</div>
				}
		}
	}

	render() {
	 	if (this.props.myPlayerId !== this.props.currentPlayerId) {
			// "It's _'s turn."
			return <div className="interactive">
				{this.renderMessages()}
				It's <span id="current-player-name">{this.props.players[this.props.currentPlayerId].name}</span>'s turn.
			</div>;
		}

		const interactions = this.props.messages.filter(([eventName, message]) => eventName !== "notify" && eventName !== "waiting-on-server");

		// It's your turn.
		// TODO: Will we ever hit the "Take Your Turn" case here?
		if (interactions.length === 0) {
			return <div className="interactive">
				{this.renderMessages()}
				You will go first.
				<div className="button" onClick={this.props.executeTurn}>{(this.props.numTurns === 0) ? "Start Game" : "Take Your Turn"}</div>
			</div>;
		}

		return <div className="interactive">
			{this.renderMessages()}
			{this.renderCtaButton(interactions)}
		</div>;
	}
}

MessageBox.propTypes = {
	messages: PropTypes.arrayOf(PropTypes.array),
	numTurns: PropTypes.number,
	currentPlayerId: PropTypes.number,
	myPlayerId: PropTypes.number,
	players: PropTypes.arrayOf(PropTypes.instanceOf(Player)),
	waitingForServer: PropTypes.bool,
	executeTurn: PropTypes.func,
	concludeTurn: PropTypes.func,
	respondToBuyOffer: PropTypes.func,
	respondPayOutOfJail: PropTypes.func,
	clearMessages: PropTypes.func
};

export default MessageBox;