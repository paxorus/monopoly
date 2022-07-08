import {Place} from "/javascripts/common/models/place.js";
import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import validate from "/javascripts/validate-props.js";


class TradePropertyListSelector extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	getSelectedClass(placeIdx) {
		return this.props.selectedProperties.includes(placeIdx) ? "" : "deselected-property-name";
	}

	getPropertyColor(placeIdx) {
		return {
			backgroundColor: this.props.selectedProperties.includes(placeIdx) ? PlaceConfigs[placeIdx].color : "rgba(0, 0, 0, 0)",
			borderColor: PlaceConfigs[placeIdx].color
		};
	}

	render() {
		return <div className="property-list">
			{/*this.props.cash > 0 && <div className="offer-property">Cash: ${this.props.cash}</div>*/}
			{/*this.props.numJailCards > 0 && <div className="offer-property">Get Out of Jail Free cards: x{this.props.numJailCards}</div>*/}
			{this.props.properties.map(placeIdx =>
				<div className="offer-property clickable" key={placeIdx} onClick={() => this.props.onClickProperty(placeIdx)}>
					<div className="offer-property-color inline" style={this.getPropertyColor(placeIdx)}></div>
					<div className={`inline ${this.getSelectedClass(placeIdx)}`}>{PlaceConfigs[placeIdx].name}</div>
					{this.props.places[placeIdx].isMortgaged
						? <div className="trade-mortgage-status inline">Mortgaged</div>
						: <div className="trade-house-count inline">
							<img src="/images/house.svg" className="placed-house" />
							{this.props.places[placeIdx].houseCount}
						</div>
					}
				</div>
			)}
		</div>
	}
}

TradePropertyListSelector.propTypes = {
	cash: PropTypes.number,
	numJailCards: PropTypes.number,
	properties: PropTypes.arrayOf(PropTypes.number),
	places: PropTypes.arrayOf(PropTypes.instanceOf(Place)),
	selectedProperties: PropTypes.arrayOf(PropTypes.number),
	onClickProperty: PropTypes.func
};

export default TradePropertyListSelector;