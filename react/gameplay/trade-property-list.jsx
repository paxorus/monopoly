import {Place} from "/javascripts/common/models/place.js";
import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import validate from "/javascripts/validate-props.js";


class TradePropertyList extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	render() {
		return <div className="property-list">
			{this.props.cash > 0 && <div className="offer-property">Cash: ${this.props.cash}</div>}
			{this.props.numJailCards > 0 && <div className="offer-property">Get Out of Jail Free cards: x{this.props.numJailCards}</div>}
			{this.props.properties.map(placeIdx =>
				<div className="offer-property" key={placeIdx}>
					<div className="offer-property-color inline" style={{backgroundColor: PlaceConfigs[placeIdx].color}}></div>
					<div className="inline">{PlaceConfigs[placeIdx].name}</div>
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

TradePropertyList.propTypes = {
	cash: PropTypes.number,
	numJailCards: PropTypes.number,
	properties: PropTypes.arrayOf(PropTypes.number),
	places: PropTypes.arrayOf(PropTypes.instanceOf(Place))
};

export default TradePropertyList;