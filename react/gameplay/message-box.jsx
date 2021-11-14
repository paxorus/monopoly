import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import Player from "/javascripts/gameplay/player.js";
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

	renderCtaButton() {
		// If the last message was a call-to-action, repeat it. There is at least
		// one saved message if a player has clicked "Start Game", which is the
		// initial "advance-turn" message indicating the previous player has gone.
		const interactions = this.props.messages.filter(([eventName, message]) => eventName !== "notify");

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
					<div>{`No double... ${me.name}, you have ${me.jailDays} turn${plural} remaining on your sentence.`}</div>;
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
				// updateTurn(finalMessage.nextPlayerId);
				// Display whose turn it is.
				if (finalMessage.nextPlayerId === this.props.myPlayerId) {
					// $("#waiting-on-player").css("display", "none");
					// $("#execute-turn").css("display", "block");
					// $("#interactive").css("display", "block");
					// MessageBox.clear();
					return <div className="button" onClick={this.props.executeTurn} id="execute-turn">Take Your Turn</div>;
				} else {
					return <div>{`It's ${this.props.players[finalMessage.nextPlayerId].name}'s turn.`}</div>
				}
		}
	}

	render() {
	 	if (this.props.myPlayerId !== this.props.currentPlayerId) {
			// "It's _'s turn."
			console.log(this.props.currentPlayerId);
			return <div id="waiting-on-player" className="interactive">
				It's <span id="current-player-name">{this.props.players[this.props.currentPlayerId].name}</span>'s turn.
			</div>;
		}

		if (this.props.messages.length === 0) {
	 		if (this.props.numTurns === 0) {
				// "Start Game"
				return <div id="initial-interactive" className="interactive">
					You will go first.
					<div className="button" onClick={this.props.executeTurn}>Start Game</div>
				</div>;
			} else {
				return <div className="button" onClick={this.props.executeTurn} id="execute-turn">Take Your Turn</div>;
			}
		}

		return <div id="interactive" className="interactive">
			<div id="message-box">
				{this.renderMessages()}
			</div>
			<div id="button-box">
				{this.renderCtaButton()}
			</div>
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
	respondPayOutOfJail: PropTypes.func
};

export default MessageBox;