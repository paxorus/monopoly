import InviteLink from "/javascripts/lobby/invite-link.js";
import GameBoard from "/javascripts/lobby/game-board.js";
import GuestJoinModal from "/javascripts/lobby/guest-join-modal.js";
import PlayerList from "/javascripts/lobby/player-list.js";


class LobbyPage extends React.Component {
	constructor(props) {
		super(props);
		console.log(props);

		const socket = io("/lobby");

		socket.emit("open-lobby", {lobbyId: props.lobbyId});

		socket.on("join-lobby", ({userId, name, sprite}) => this.addPlayerToList(userId, name, sprite));

		socket.on("leave-lobby", ({userId}) => this.removePlayerFromList(userId));

		socket.on("start-game", () => location.reload());

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

		this.state = {
			memberMap: props.joinedPlayers,
			hasJoinedGame: props.hasJoinedGame,
			isGuestModalOpen: !props.hasJoinedGame,
			percentBlur: props.hasJoinedGame ? 0 : 100
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

	handleGuestClickJoin() {
		this.setState(state => {
			if (state.hasJoinedGame) {
				// Leave lobby
				this.socket.emit("leave-lobby");
				return {
					hasJoinedGame: false
				};
			} else {
				// Open modal to join lobby
				return {
					isGuestModalOpen: true
				};
			}
		});
	}

	onJoinGame({name, sprite}) {
		this.socket.emit("join-lobby", {name, sprite});
		this.setState(state => ({
			isGuestModalOpen: false,
			hasJoinedGame: true			
		}));
	}

	onClickCloseModal() {
		this.setState({
			isGuestModalOpen: false
		});
	}

	onModalSlide(percentOpen) {
		this.setState({
			percentBlur: percentOpen
		});
	}

	getPageBlurLevel(percentBlur) {
		const from = 0;
		const to = 10;
		return {filter: `blur(${(to - from) * percentBlur / 100 + from}px)`};
	}

	getOverlayOpacityLevel(percentBlur) {
		const from = 0;
		const to = 0.8;
		return {
			opacity: (to - from) * percentBlur / 100,
			zIndex: (percentBlur > 0) ? 2 : -1
		};
	}

	render() {
		return (
			<div>
				{/* Container for all content except the overlay and modal layer. */}
				<div id="page-container" style={this.getPageBlurLevel(this.state.percentBlur)}>

					{/* Game board */}
					<GameBoard />

					{/* Container that excludes the game board layer. */}
					<div id="container">
						<h1 style={{marginBottom: "5px"}}>{this.props.gameName}</h1>
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
						{(this.props.adminId === this.props.yourId) ?
							<div>
								<div id="start-game" className="button" style={{display: "inline-block"}} onClick={this.handleAdminConvertToGame.bind(this)}>Start Game</div>
								<div id="disband-lobby" className="button-secondary" style={{display: "inline-block", marginLeft: "5px"}} onClick={this.handleAdminDisbandLobby.bind(this)}>Disband Lobby</div>
							</div>
							:
							<div id="join-leave-game"
								className={this.state.hasJoinedGame ? "button-secondary" : "button"}
								style={{display: "inline-block"}}
								onClick={this.handleGuestClickJoin.bind(this)}>
								{this.state.hasJoinedGame ? "Leave Game" : "Join Game"}
							</div>
						}
					</div>
				</div>

				{/* Overlay for modal */}
				<div id="full-page-overlay" style={this.getOverlayOpacityLevel(this.state.percentBlur)}></div>

				<GuestJoinModal
					isOpen={this.state.isGuestModalOpen}
					playerIcons={this.props.playerIcons}
					onJoinGame={this.onJoinGame.bind(this)}
					onModalSlide={this.onModalSlide.bind(this)}
					onClickCloseModal={this.onClickCloseModal.bind(this)} />
			</div>
		);
	}
}


function render(props, domElement) {
	ReactDOM.render(<LobbyPage {...props} />, domElement);
}

export {
	render
};