class PlayerList extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <div id="joined-players">
			{Object.entries(this.props.players).map(([playerId, {name, sprite}]) =>
				<div className="player-row" key={playerId}>
					<div className="sprite-circle">
						<img className="lobby-player-sprite" src={sprite} />
					</div>
					<div className="lobby-player-name" style={(playerId === this.props.yourId) ? {backgroundColor: "#08F"} : {}}>
						{name}
						{(playerId === this.props.adminId) && <span> (admin)</span>}
						{(playerId === this.props.yourId) && <span> (you)</span>}
					</div>
				</div>
			)}
		</div>
	}
}

export default PlayerList;