class GuestJoinModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			playerName: null,
			selectedSprite: null,
			mousedOverSprite: null,
			percentOpen: props.isOpen ? 100 : 0
		};
	}

	handleClickSprite(sprite) {
		this.setState(state => ({
			selectedSprite: sprite
		}));
	}

	handleMouseOverSprite(sprite) {
		this.setState(state => ({
			mousedOverSprite: sprite
		}));
	}

	handleMouseOutOfSprite(sprite) {
		this.setState(state => ({
			mousedOverSprite: null
		}));
	}

	shouldHighlightSprite(playerIcon) {
		return this.state.selectedSprite === playerIcon || this.state.mousedOverSprite === playerIcon;
	}

	handleChangeName(event) {
		// TODO: Validate and show reason.
		this.setState(state => ({
			playerName: event.target.value
		}));
	}	

	// Submit the form.
	handleClickJoinGame() {
		const {isValid} = this.isValidString(this.state.playerName);
		if (isValid) {
			this.props.onJoinGame({
				name: this.state.playerName,
				sprite: this.state.selectedSprite
			});
		}
	}

	// TODO: Duplicated from other modals.
	isValidString(input) {
		// TODO: URL-unsafe characters like forward-slash
		if (input.length < 5 || input.length > 50) {
			return {isValid: false, reason: "Name must be 5-50 characters long."};
		}

		for (let i = 0; i < input.length; i ++) {
			const charCode = input.charCodeAt(i);
			if (charCode < 32 || charCode > 126) {
				return {isValid: false, reason: "Invalid character, only alphanumeric and common symbols are allowed."};
			}
		}

		return {isValid: true, reason: ""}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// If isOpen became true.
		if (!prevProps.isOpen && this.props.isOpen) {
			this.slideIn();
		}
		// If isOpen became false.
		if (prevProps.isOpen && !this.props.isOpen) {
			this.slideOut();
		}
	}

	slideIn() {
		setTimeout(() => {
			this.setState((state, props) => {
				props.onModalSlide(state.percentOpen);
				if (state.percentOpen < 100) {
					this.slideIn();
				}
				return {
					percentOpen: state.percentOpen + 10
				};
			});
		}, 5);
	}

	slideOut() {
		setTimeout(() => {
			this.setState((state, props) => {
				props.onModalSlide(state.percentOpen);
				if (state.percentOpen > 0) {
					this.slideOut();
				}
				return {
					percentOpen: state.percentOpen - 10
				};
			});
		}, 5);
	}

	getTop(percentOpen) {
		const to = 20;
		const from = 100;
		return {
			top: `${(to - from) * percentOpen / 100 + from}%`,
			display: (percentOpen <= 0) ? "none" : "block"
		};
	}

	render() {
		return (
			<div id="guest-join-modal" className="form-modal" style={this.getTop(this.state.percentOpen)}>

				<h2>Create Your Player</h2><img className="close-modal-x" src="/images/close-modal-x.svg" onClick={this.props.onClickCloseModal.bind(this)} />

				Enter your name:
				<input id="player-name-field" className="text-input" type="text" placeholder="Player name" onChange={event => this.handleChangeName(event)} />

				<p>Pick your icon:
					<br />
					{this.props.playerIcons.map(playerIcon =>
						<span className="player-icon" key={playerIcon} style={{filter: (this.shouldHighlightSprite(playerIcon) ? "brightness(1.0)" : "brightness(0.25)")}}>
							<img src={playerIcon} height="100"
								onClick={() => this.handleClickSprite(playerIcon)}
								onMouseOver={() => this.handleMouseOverSprite(playerIcon)}
								onMouseOut={() => this.handleMouseOutOfSprite()}
							/>
						</span>
					)}
				</p>

				<div id="join-game" className="button" style={{float: "right"}} onClick={this.handleClickJoinGame.bind(this)}>Join Game</div>
			</div>
		);
	}
}

export default GuestJoinModal;