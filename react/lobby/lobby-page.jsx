import EditPlayerModal from "/javascripts/lobby/edit-player-modal.js";
import InviteLink from "/javascripts/lobby/invite-link.js";
import GameBoard from "/javascripts/lobby/game-board.js";
import Modal from "/javascripts/lobby/modal.js";
import ModalPage from "/javascripts/lobby/modal-page.js";
import PlayerList from "/javascripts/lobby/player-list.js";
import validate from "/javascripts/validate-props.js";


class LobbyPage extends React.Component {
	constructor(props) {
		validate(super(props));

		const socket = io("/lobby");

		socket.emit("open-lobby", {lobbyId: props.lobbyId});

		socket.on("join-lobby", ({userId, name, sprite}) => this.addPlayerToList(userId, name, sprite));

		socket.on("leave-lobby", ({userId}) => this.removePlayerFromList(userId));

		socket.on("update-member", ({userId, name, sprite}) => this.addPlayerToList(userId, name, sprite));

		socket.on("update-admin", ({userId, name, sprite, gameName}) => {
			this.addPlayerToList(userId, name, sprite);
			this.setState({gameName});
		});

		socket.on("reload-for-game", () => location.reload());

		socket.on("return-to-landing-page", ({cookieKey, cookieValue}) => {
			document.cookie = `${cookieKey}=${encodeURIComponent(JSON.stringify(cookieValue))};max-age=24*60*60;samesite=strict;path=/`;
			location.href = "/";
		});

		socket.on("bad-player-id", () => {
			console.error("Server did not recognize player ID. :(");
		});

		socket.on("bad-secret-key", () => {
			console.error("Server recognized player ID but failed credentials. :(");
		});

		this.socket = socket;
		this.isAdmin = (this.props.adminId === this.props.yourId);

		this.state = {
			gameName: props.gameName,
			memberMap: props.joinedPlayers,
			hasJoinedGame: props.hasJoinedGame,
			isEditModalOpen: !props.hasJoinedGame,
			isDisbandModalOpen: false
		};
	}

	addPlayerToList(playerId, name, sprite) {
		this.setState(state => ({
			memberMap: {
				...state.memberMap,
				[playerId]: {name, sprite}
			}
		}));
	}

	removePlayerFromList(playerId) {
		this.setState(state => {
			const memberMap = {...state.memberMap};
			delete memberMap[playerId];
			return {memberMap};
		});
	}

	handleAdminConvertToGame() {
		// This will reload the page for all users.
		this.socket.emit("convert-to-game");
	}

	handleAdminDisbandLobby() {
		// This will load the landing page for all users, and issue an explanatory toast.
		this.socket.emit("disband-lobby");
	}

	handleAdminClickDisband() {
		this.setState({isDisbandModalOpen: true});
	}

	handleClickEdit() {
		// Open modal to create player
		this.setState({isEditModalOpen: true});
	}

	handleGuestClickLeave() {
		this.setState(state => {
			this.socket.emit("leave-lobby");
			return {hasJoinedGame: false};
		});
	}

	handleJoinGame({gameName, name, sprite}) {
		this.setState(state => {
			if (this.isAdmin) {
				this.socket.emit("update-admin", {gameName, name, sprite});
			} else if (state.hasJoinedGame) {
				this.socket.emit("update-member", {name, sprite});
			} else {
				this.socket.emit("join-lobby", {name, sprite});
			}

			return {
				isEditModalOpen: false,
				hasJoinedGame: true
			};
		});
	}

	handleClickCloseEditModal() {
		this.setState({isEditModalOpen: false});
	}

	handleClickCloseDisbandModal() {
		this.setState({isDisbandModalOpen: false});
	}

	buildEditModal(handleModalSlide) {
		return <EditPlayerModal
			key="edit"
			isAdmin={this.isAdmin}
			isOpen={this.state.isEditModalOpen}
			playerIcons={this.props.playerIcons}
			gameName={this.state.gameName}
			player={this.state.memberMap[this.props.yourId]}
			hasJoinedGame={this.state.hasJoinedGame}
			onJoinGame={this.handleJoinGame.bind(this)}
			onModalSlide={handleModalSlide}
			onClickCloseModal={this.handleClickCloseEditModal.bind(this)} />;
	}

	buildDisbandModal(handleModalSlide) {
		return <Modal title="Disband Lobby"
			key="disband"
			isOpen={this.state.isDisbandModalOpen}
			onModalSlide={handleModalSlide}
			onClickCloseModal={this.handleClickCloseDisbandModal.bind(this)}>
			This will boot out all players and delete the lobby. Are you sure?
			<br />
			<br />
			<div className="button inline left-margin" style={{float: "right"}} onClick={this.handleClickCloseDisbandModal.bind(this)}>Keep Lobby</div>
			<div className="button-secondary inline" style={{float: "right"}} onClick={this.handleAdminDisbandLobby.bind(this)}>Delete Lobby</div>
		</Modal>
	}

	getModals() {
		const modals = [{
			isOpen: this.state.isEditModalOpen,
			onClose: this.handleClickCloseEditModal.bind(this),
			build: this.buildEditModal.bind(this)
		}];

		if (this.isAdmin) {
			modals.push({
				isOpen: this.state.isDisbandModalOpen,
				onClose: this.handleClickCloseDisbandModal.bind(this),
				build: this.buildDisbandModal.bind(this)
			});
		}

		return modals;
	}

	render() {
		return <ModalPage modals={this.getModals()}>

			<GameBoard faded />

			{/* Container that excludes the game board layer. */}
			<div id="lobby-foreground">
				<h1 style={{marginBottom: "5px"}}>{this.state.gameName}</h1>
				<span title={new Date(this.props.gameCreateTime.timestamp).toLocaleString()}>Created {this.props.gameCreateTime.friendly}</span>

				{/* Player list */}
				<h2>Current Players</h2>
				<PlayerList players={this.state.memberMap} yourId={this.props.yourId} adminId={this.props.adminId} />

				<br />
				<br />
				<InviteLink />
				<br />
				<br />

				{/* Buttons */}
				{(this.isAdmin) ?
					<div>
						<div className="button inline right-margin" onClick={this.handleAdminConvertToGame.bind(this)}>Start Game</div>
						<div className="button-secondary inline right-margin" onClick={this.handleClickEdit.bind(this)}>Edit Settings</div>
						<div className="button-negative inline" onClick={this.handleAdminClickDisband.bind(this)}>Disband Lobby</div>
					</div>
					:
					((this.state.hasJoinedGame) ?
						<div>
							<div className="button inline right-margin" onClick={this.handleClickEdit.bind(this)}>
								Edit Player
							</div>
							<div className="button-negative inline" onClick={this.handleGuestClickLeave.bind(this)}>
								Leave Game
							</div>
						</div>
						:
						<div>
							<div className="button inline margin" onClick={this.handleClickEdit.bind(this)}>
								Join Game
							</div>
						</div>
					)
				}
			</div>
		</ModalPage>
	}
}

LobbyPage.propTypes = {
	lobbyId: PropTypes.string,
	adminId: PropTypes.string,
	gameName: PropTypes.string,
	yourId: PropTypes.string,
	hasJoinedGame: PropTypes.bool,
	playerIcons: PropTypes.arrayOf(PropTypes.string),
	gameCreateTime: PropTypes.exact({
		friendly: PropTypes.string,
		timestamp: PropTypes.number
	}),
	joinedPlayers: PropTypes.objectOf(PropTypes.exact({
		name: PropTypes.string,
		sprite: PropTypes.string
	}))
};

function render(props, domElement) {
	ReactDOM.render(<LobbyPage {...props} />, domElement);
}

export {
	render
};