import ImagePicker from "/javascripts/lobby/image-picker.js";
import Modal from "/javascripts/common/modal/modal.js";
import TextInput from "/javascripts/common/text-input.js";
import validate from "/javascripts/validate-props.js";


class EditPlayerModal extends React.Component {
	constructor(props) {
		validate(super(props));
		this.state = {
			gameName: props.gameName,
			playerName: props.player ? props.player.name : "",
			playerSprite: props.player ? props.player.sprite : null
		};
	}

	handleClickSprite(sprite) {
		this.setState(state => ({
			playerSprite: sprite
		}));
	}

	handleChangeGameName(value) {
		this.setState({gameName: value});		
	}

	handleChangePlayerName(value) {
		this.setState({playerName: value});
	}

	// Submit the form.
	handleClickJoinGame() {
		if (!this.isFormValid()) {
			// Ignore click.
			return;
		}
		this.props.onJoinGame({
			gameName: this.state.gameName,
			name: this.state.playerName,
			sprite: this.state.playerSprite
		});
	}

	// TODO: Duplicated from other modals.
	getValidationComplaint(input) {
		// TODO: URL-unsafe characters like forward-slash

		// Don't annoy the user if they've left the field empty.
		if (input === "") {
			return null;
		}

		if (input.length < 5 || input.length > 50) {
			return "Name must be 5-50 characters long.";
		}

		for (let i = 0; i < input.length; i ++) {
			const charCode = input.charCodeAt(i);
			if (charCode < 32 || charCode > 126) {
				return `Invalid character ${input[i]}, only alphanumeric and common symbols are allowed.`;
			}
		}

		return null;
	}

	isFormValid() {
		if (this.isAdmin && (this.state.gameName === "" || this.getValidationComplaint(this.state.gameName) !== null)) {
			return false;
		}

		if (this.state.playerName === "" || this.getValidationComplaint(this.state.playerName) !== null) {
			return false;
		}

		return this.state.playerSprite !== null;
	}

	render() {
		return (
			<Modal title="Customize Your Player"
				isOpen={this.props.isOpen}
				onModalSlide={this.props.onModalSlide}
				onClickCloseModal={this.props.onClickCloseModal}>

				{this.props.isAdmin && <div>
					<TextInput prompt="Edit the game name:"
						placeholder="Game name"
						value={this.state.gameName}
						getValidationComplaint={() => this.getValidationComplaint(this.state.gameName)}
						onChange={this.handleChangeGameName.bind(this)} />
					<br />
				</div>}

				<TextInput prompt="Enter your display name:"
					placeholder="Player name"
					value={this.state.playerName}
					getValidationComplaint={() => this.getValidationComplaint(this.state.playerName)}
					onChange={this.handleChangePlayerName.bind(this)} />

				<p>Pick your icon:</p>
				<ImagePicker
					imageUrls={this.props.playerIcons}
					selectedImage={this.state.playerSprite}
					onClickImage={this.handleClickSprite.bind(this)}
				/>

				<br />
				<div className={`button ${this.isFormValid() ? "" : "button-disabled"}`}
					style={{float: "right"}}
					onClick={this.handleClickJoinGame.bind(this)}>
					{this.props.isAdmin ? "Save Settings" : (this.props.hasJoinedGame ? "Save Player" : "Join Game")}
				</div>
			</Modal>
		);
	}
}

EditPlayerModal.propTypes = {
	isAdmin: PropTypes.bool,
	isOpen: PropTypes.bool,
	playerIcons: PropTypes.arrayOf(PropTypes.string),
	gameName: PropTypes.string,
	player: PropTypes.exact({
		name: PropTypes.string,
		sprite: PropTypes.string
	}),
	hasJoinedGame: PropTypes.bool,
	onJoinGame: PropTypes.func,
	onModalSlide: PropTypes.func,
	onClickCloseModal: PropTypes.func
};

export default EditPlayerModal;