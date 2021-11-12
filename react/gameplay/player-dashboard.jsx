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

		this.timeoutId = -1;
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
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => {
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
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() => {
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

	renderPropertyActionButtons(property) {
		return <div className="inline">
			{this.renderMortgageButton(property)}
			{this.props.myMonopolies.has(property.placeIdx) && this.renderBuyHouseButton(property)}
			{this.props.myMonopolies.has(property.placeIdx) && this.renderSellHouseButton(property)}
		</div>
	}

	renderMortgageButton(property) {
		const title = property.isMortgaged ? "Unmortgage the Property" : "Mortgage the Property";
		const symbol = property.isMortgaged ? "$" : "!";
		return <span className="button house-button property-mortgager" title={title}>
			<img className="house-icon" src="/images/mortgage.svg" />
			<sup className="mortgage-symbol">{symbol}</sup>
		</span>;
	}

	renderBuyHouseButton(property) {
		const enabledClass = property.houseCount < 5 ? "" : "button-disabled";
		return <span className={`button ${enabledClass} house-button house-adder`} title="Buy a House">
			<img className="house-icon" src="/images/house.svg" />
			<sup className="house-plus-sign">+</sup>
		</span>;
	}

	renderSellHouseButton(property) {
		const enabledClass = property.houseCount > 0 ? "" : "button-disabled";
		return <span className={`button ${enabledClass} house-button house-remover`} title="Sell a House">
			<img className="house-icon" src="/images/house.svg" />
			<sup className="house-minus-sign">-</sup>
		</span>;
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

			{/* Property list */}
			<div style={{height: this.getHeight()}} className="dashboard">
				{this.props.properties.map(property =>
					<div className="hud-property" key={property.placeIdx}
						onMouseOver={() => this.props.onMouseOverProperty(property.placeIdx, true)}
						onMouseOut={() => this.props.onMouseOverProperty(property.placeIdx, false)}
						onClick={() => this.props.onClickProperty(property.placeIdx)}>
						<div className="hud-property-color" style={{backgroundColor: property.color}}></div>
						<span className="hud-property-name">{property.name}</span>

						{/* Property action buttons */}
						{this.props.isMe && this.renderPropertyActionButtons(property)}
					</div>
				)}
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
	myMonopolies: PropTypes.instanceOf(Set),
	onClickHeader: PropTypes.func,
	onClickProperty: PropTypes.func,
	onMouseOverProperty: PropTypes.func
};

export default PlayerDashboard;