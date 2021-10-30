import validate from "/javascripts/validate-props.js";


class PlayerList extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	render() {
		return <div id="joined-players">
			{Object.entries(this.props.players).map(([playerId, {name, sprite}]) =>
				<div className="player-row" key={playerId}>
					<div className="sprite-circle">
						<center><img className="lobby-player-sprite" src={sprite} /></center>
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

PlayerList.propTypes = {
	players: PropTypes.objectOf(PropTypes.exact({
		name: PropTypes.string,
		sprite: PropTypes.string
	})),
	yourId: PropTypes.string,
	adminId: PropTypes.string
};

export default PlayerList;