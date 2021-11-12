import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import Player from "/javascripts/gameplay/player.js";
import validate from "/javascripts/validate-props.js";


const DASHBOARD_HEIGHT = 450;
const FRAME_DURATION_MS = 10;
const PERCENT_PROGRESS_PER_FRAME = 5;

class PlayerDashboard extends React.Component {
	constructor(props) {
		validate(super(props));

		this.state = {
			percentOpen: props.isOpen ? 100 : 0
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (!prevProps.isOpen && this.props.isOpen) {
			this.slideOpen();
		}
		if (prevProps.isOpen && !this.props.isOpen) {
			this.slideClosed();
		}
	}

	slideOpen() {
		setTimeout(() => {
			this.setState(state => {
				if (state.percentOpen < 100) {
					this.slideOpen();
				}
				return {
					percentOpen: state.percentOpen + PERCENT_PROGRESS_PER_FRAME
				};
			});
		}, FRAME_DURATION_MS);
	}

	slideClosed() {
		setTimeout(() => {
			this.setState(state => {
				if (state.percentOpen > 0) {
					this.slideClosed();
				}
				return {
					percentOpen: state.percentOpen - PERCENT_PROGRESS_PER_FRAME
				};
			});
		}, FRAME_DURATION_MS);
	}

	getHeight() {
		const currentHeight = this.state.percentOpen * DASHBOARD_HEIGHT / 100;
		return `${currentHeight}px`;
	}

	renderJailCards(numJailCards, jailDays) {
		const isUsageEnabled = (jailDays > 0 && numJailCards > 0) ? "" : "button-disabled";
		return <div className="dashboard-jail-cards">
			<br />Get Out of Jail Free x{numJailCards}
			{this.props.isMe && <span className={`button use-jail-card ${isUsageEnabled}`}>Use Card</span>}
		</div>;
	}

	render() {
		const {num, spriteFileName, name, placeIdx, balance, numJailCards, jailDays} = this.props.player;
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
			<div style={{height: this.getHeight()}} className="dashboard">
				{this.props.properties.map(property => <div className="hud-property" key={property.placeIdx}
					onMouseOver={() => this.props.onMouseOverProperty(property.placeIdx, true)}
					onMouseOut={() => this.props.onMouseOverProperty(property.placeIdx, false)}
					onClick={() => this.props.onClickProperty(property.placeIdx)}>
					<div className="hud-property-color" style={{backgroundColor: property.color}}></div>
					<span className="hud-property-name">{property.name}</span>
				</div>)}
				{this.renderJailCards(numJailCards, jailDays)}
			</div>
		</div>
	}
}

PlayerDashboard.propTypes = {
	isOpen: PropTypes.bool,
	isMe: PropTypes.bool,
	player: PropTypes.instanceOf(Player),
	properties: PropTypes.arrayOf(PropTypes.exact({
		name: PropTypes.string,
		price: PropTypes.number,
		rents: PropTypes.arrayOf(PropTypes.number),
		housePrice: PropTypes.number,
		color: PropTypes.string,
		ownerNum: PropTypes.number,
		houseCount: PropTypes.number,
		isMortgaged: PropTypes.bool,
		placeIdx: PropTypes.number
	})),
	onClickHeader: PropTypes.func,
	onClickProperty: PropTypes.func,
	onMouseOverProperty: PropTypes.func
};

export default PlayerDashboard;