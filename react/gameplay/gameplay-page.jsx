import {places, Locations} from "/javascripts/location-configs.js";
import GameBoard from "/javascripts/common/game-board.js";
import validate from "/javascripts/validate-props.js";


class GameplayPage extends React.Component {
	constructor(props) {
		validate(super(props));

		const socket = io("/gameplay");
		window.socket = socket;

		socket.on("start-up", this.startUp.bind(this));

		// // Updates
		// socket.on("dialog", text => log(text));
		// socket.on("notify", text => log(text));

		// socket.on("update-balance", ({playerId, balance}) => {
		// 	GlobalState.players[playerId].updateBalance(balance);
		// });

		// socket.on("update-location", ({playerId, placeIdx}) => {
		// 	GlobalState.players[playerId].updateLocation(placeIdx);
		// });

		// // Turn actions
		// socket.on("allow-conclude-turn", () => {
		// 	allowConcludeTurn();
		// });

		// socket.on("advance-turn", ({nextPlayerId}) => {
		// 	updateTurn(nextPlayerId);
		// });

		// // Property actions
		// socket.on("offer-unowned-property", ({placeIdx}) => {
		// 	offerUnownedProperty(GlobalState.me, placeIdx);
		// });

		// socket.on("purchase-property", ({playerId, placeIdx}) => {
		// 	purchaseProperty(GlobalState.players[playerId], placeIdx);
		// });

		// socket.on("build-house-buttons", ({placeIdx}) => {
		// 	buildHouseButtons(placeIdx);
		// });

		// socket.on("buy-house", ({playerId, placeIdx}) => {
		// 	buyHouse(GlobalState.players[playerId], placeIdx);
		// });

		// socket.on("sell-house", ({playerId, placeIdx}) => {
		// 	sellHouse(GlobalState.players[playerId], placeIdx);
		// });

		// // Jail actions
		// socket.on("go-to-jail", ({playerId}) => {
		// 	GlobalState.players[playerId].goToJail();
		// });

		// socket.on("get-out-of-jail", ({playerId}) => {
		// 	GlobalState.players[playerId].getOutOfJail();
		// });

		// socket.on("add-jail-card", ({playerId}) => {
		// 	addGetOutOfJailFreeCard(GlobalState.players[playerId]);
		// });

		// socket.on("use-jail-card", ({playerId}) => {
		// 	updateGetOutOfJailFreeCards(GlobalState.players[playerId]);
		// });

		// socket.on("update-jail-days", ({playerId, jailDays}) => {
		// 	GlobalState.players[playerId].updateJailDays(jailDays);
		// });

		// socket.on("offer-pay-out-of-jail", () => {
		// 	offerPayOutOfJail();
		// });

		// // Tax actions
		// socket.on("update-tax", ({tax}) => {
		// 	GlobalState.tax = tax;
		// });

		// // Mortgage actions
		// socket.on("mortgage-property", ({playerId, placeIdx}) => {
		// 	mortgageProperty(GlobalState.players[playerId], placeIdx);
		// });

		// socket.on("unmortgage-property", ({playerId, placeIdx}) => {
		// 	unmortgageProperty(GlobalState.players[playerId], placeIdx);
		// });

		socket.emit("start-up", {gameId: props.gameId});
		this.socket = socket;

		this.state = {
			players: []
		};
	}

	startUp({playerData, locationData, monopolies, yourPlayerId, currentPlayerId, tax, numTurns}) {
		const players = playerData.map(({name, num, spriteFileName, balance, placeIdx}) => {
			// TODO: Move to player.js.
			const player = new Player(name, num, spriteFileName);
			player.balance = balance;
			player.updateLocation(placeIdx);
			return player;
		});

		this.setState({
			players,
			me: players[yourPlayerId],
			tax
		});
	}

	// addPlayerToList(playerId, name, sprite) {
	// 	this.setState(state => ({
	// 		memberMap: {
	// 			...state.memberMap,
	// 			[playerId]: {name, sprite}
	// 		}
	// 	}));
	// }

	// removePlayerFromList(playerId) {
	// 	this.setState(state => {
	// 		const memberMap = {...state.memberMap};
	// 		delete memberMap[playerId];
	// 		return {memberMap};
	// 	});
	// }

	// handleAdminConvertToGame() {
	// 	// This will reload the page for all users.
	// 	this.socket.emit("convert-to-game");
	// }

	// handleAdminDisbandLobby() {
	// 	// This will load the landing page for all users, and issue an explanatory toast.
	// 	this.socket.emit("disband-lobby");
	// }

	// handleAdminClickDisband() {
	// 	this.setState({isDisbandModalOpen: true});
	// }

	// handleClickEdit() {
	// 	// Open modal to create player
	// 	this.setState({isEditModalOpen: true});
	// }

	// handleGuestClickLeave() {
	// 	this.setState(state => {
	// 		this.socket.emit("leave-lobby");
	// 		return {hasJoinedGame: false};
	// 	});
	// }

	// handleJoinGame({gameName, name, sprite}) {
	// 	this.setState(state => {
	// 		if (this.isAdmin) {
	// 			this.socket.emit("update-admin", {gameName, name, sprite});
	// 		} else if (state.hasJoinedGame) {
	// 			this.socket.emit("update-member", {name, sprite});
	// 		} else {
	// 			this.socket.emit("join-lobby", {name, sprite});
	// 		}

	// 		return {
	// 			isEditModalOpen: false,
	// 			hasJoinedGame: true
	// 		};
	// 	});
	// }

	// handleClickCloseEditModal() {
	// 	this.setState({isEditModalOpen: false});
	// }

	// handleClickCloseDisbandModal() {
	// 	this.setState({isDisbandModalOpen: false});
	// }

	// buildEditModal(handleModalSlide) {
	// 	return <EditPlayerModal
	// 		key="edit"
	// 		isAdmin={this.isAdmin}
	// 		isOpen={this.state.isEditModalOpen}
	// 		playerIcons={this.props.playerIcons}
	// 		gameName={this.state.gameName}
	// 		player={this.state.memberMap[this.props.yourId]}
	// 		hasJoinedGame={this.state.hasJoinedGame}
	// 		onJoinGame={this.handleJoinGame.bind(this)}
	// 		onModalSlide={handleModalSlide}
	// 		onClickCloseModal={this.handleClickCloseEditModal.bind(this)} />;
	// }

	// buildDisbandModal(handleModalSlide) {
	// 	return <Modal title="Disband Lobby"
	// 		key="disband"
	// 		isOpen={this.state.isDisbandModalOpen}
	// 		onModalSlide={handleModalSlide}
	// 		onClickCloseModal={this.handleClickCloseDisbandModal.bind(this)}>
	// 		This will boot out all players and delete the lobby. Are you sure?
	// 		<br />
	// 		<br />
	// 		<div className="button inline left-margin" style={{float: "right"}} onClick={this.handleClickCloseDisbandModal.bind(this)}>Keep Lobby</div>
	// 		<div className="button-secondary inline" style={{float: "right"}} onClick={this.handleAdminDisbandLobby.bind(this)}>Delete Lobby</div>
	// 	</Modal>
	// }

	// getModals() {
	// 	const modals = [{
	// 		isOpen: this.state.isEditModalOpen,
	// 		onClose: this.handleClickCloseEditModal.bind(this),
	// 		build: this.buildEditModal.bind(this)
	// 	}];

	// 	if (this.isAdmin) {
	// 		modals.push({
	// 			isOpen: this.state.isDisbandModalOpen,
	// 			onClose: this.handleClickCloseDisbandModal.bind(this),
	// 			build: this.buildDisbandModal.bind(this)
	// 		});
	// 	}

	// 	return modals;
	// }

	handleClickHudHeader(playerNum) {
		// Expand HUD on click.
		// if (dashboard.style.display === "none") {
		// 	slide(playerNum);
		// }
	}

	render() {
		return <div>

			<GameBoard players={this.state.players.map(({num, spriteFileName, placeIdx, jailDays}) => ({num, spriteFileName, placeIdx, jailDays}))} />

			{/* Property description card */}
			<div id="location-card">
				<div className="head" id="propname"></div>
				<center style={{backgroundColor: "rgb(213,232,212)"}}>
					<div id="tax-info"></div>
					<div id="rent-table">
						<div id="price"></div>
						<div id="owner-name"></div>
						<br />
						<table>
						<tbody>
							<tr id="rent0"></tr>
							<tr id="rent1"></tr>
							<tr id="rent2"></tr>
							<tr id="rent3"></tr>
							<tr id="rent4"></tr>
							<tr id="rent5"></tr>
						</tbody>
						</table>
						<br id="mortgage-margin" />
						<div id="mortgage-value"></div>
						<div id="price-per-house"></div>
					</div>
					<div className="button-negative" onClick={this.hideLocationCard}>Close</div>
				</center>
			</div>


			<div id="initial-interactive" className="interactive" style={{display: "none"}}>
				You will go first.
				<div className="button" onClick={this.executeTurn}>Start Game</div>
			</div>

			<div id="waiting-on-player" className="interactive" style={{display: "none"}}>
				It's <span id="current-player-name"></span>'s turn.
			</div>

			<div id="interactive" className="interactive">
				<div className="button" onClick={this.executeTurn} id="execute-turn" style={{display: "none"}}>Take Your Turn</div>
				<div id="message-box">
				</div>
				<div id="button-box">
				</div>
				<div className="button" onClick={this.executeTurn} id="end-turn" style={{display: "none"}}>End Turn</div>
				{/* <br /> */}
				{/* <div className="button" onClick="trade()">Trade</div> */}
			</div>

			{/* Player HUDs */}
			<div id="heads">
				{this.state.players.map(player => <div key={player.num}>

					{/* Header: name, location, and balance. */}
					<div id={`head${player.num}`} className="player-display-head" onClick={() => this.handleClickHudHeader(player.num)}>
						<img className="display-sprite" src={player.spriteFileName} />
						{`${player.name}: `}
						<span id={`loc${player.num}`}>{places[player.placeIdx].name}</span>
						<div id={`bal${player.num}`} style={{float: "right"}}>{"$" + player.balance}</div>
					</div>

					{/* Divider bar. TODO: Convert this to a bottom margin of the header. */}
					<div className="dashboard-divider"></div>

					{/* Dashboard */}
					<div id={`user${player.num}`} style={{display: "none"}} className="dashboard">
						<span id={`property-list${player.num}`}></span>
						<span id={`jail-card${player.num}`}></span>
					</div>
				</div>)}
			</div>
		</div>
	}
}

GameplayPage.propTypes = {
	gameId: PropTypes.string
};

function render(props, domElement) {
	ReactDOM.render(<GameplayPage {...props} />, domElement);
}

export {
	render
};