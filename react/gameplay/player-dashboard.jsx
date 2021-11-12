import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import Player from "/javascripts/gameplay/player.js";
import validate from "/javascripts/validate-props.js";


class PlayerDashboard extends React.Component {
	constructor(props) {
		validate(super(props));

		// this.state = {};
	}

	// handleClickCloseLocationCard() {
	// 	this.setState({selectedPlaceIdx: -1});
	// }

	render() {
		const {num, spriteFileName, name, placeIdx, balance} = this.props.player;
		return <div key={num}>
			{/* Header: name, location, and balance. */}
			<div className="player-display-head" onClick={() => this.props.onClickHeader(num)}>
				<img className="display-sprite" src={spriteFileName} />
				<span>{`${name}: ${PlaceConfigs[placeIdx].name}`}</span>
				<div style={{float: "right"}}>
					{"$" + balance}
				</div>
			</div>

			{/* Divider bar. TODO: Convert this to a bottom margin of the header. */}
			<div className="dashboard-divider"></div>

			{/* Dashboard */}
			<div style={{display: "none"}} className="dashboard">
				<span></span>
				<span></span>
			</div>
		</div>
	}
}

PlayerDashboard.propTypes = {
	player: PropTypes.instanceOf(Player),
	onClickHeader: PropTypes.func
};

export default PlayerDashboard;