import {PlaceConfigs, Locations, BLACK_TEXT_COLORS} from "/javascripts/gameplay/location-configs.js";
import validate from "/javascripts/validate-props.js";


class LocationCard extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	render() {
		const placeIdx = this.props.placeIdx;
		if (placeIdx === -1) {
			return null;
		}

		const place = PlaceConfigs[placeIdx];
		const headerStyle = {
			color: BLACK_TEXT_COLORS.has(placeIdx) ? "black" : "white",
			backgroundColor: place.cardColor || place.color
		};

		return <div id="location-card">
			<div className="head" style={headerStyle}>{place.name}</div>
			<center style={{backgroundColor: "rgb(213,232,212)"}}>
				<div id="tax-info">{this.getTaxInfo(placeIdx)}</div>

				{this.getRentTable(placeIdx, place)}

				<div className="button-negative" onClick={this.props.onClickClose}>Close</div>
			</center>
		</div>
	}

	getTaxInfo(placeIdx) {
		switch (placeIdx) {
			case Locations.IncomeTax:
				return "Tax: $200";
			case Locations.LuxuryTax:
				return "Tax: $100";
			case Locations.FreeParking:
				return `Cash pool: $${this.props.tax}`;
			default:
				return null;
		}
	}

	getRentTable(placeIdx, place) {
		if (place.price === 0) {
			// Hide price and rents for non-properties.
			return null;
		}

		const mortgageStatus = place.isMortgaged ? "Unmortgage" : "Mortgage";
		const mortgageValue = `${mortgageStatus} Value: $${place.price / 2}`;

		switch (placeIdx) {
			case Locations.ReadingRailroad:
			case Locations.PennsylvaniaRailroad:
			case Locations.BORailroad:
			case Locations.ShortLine:
				// Display railroad rents.
				return <div id="rent-table">
					<div id="price">{`Price: $${place.price}`}</div>
					<div id="owner-name">{this.getOwnerName()}</div>
					<br />
					<table>
						<tbody>
							<tr id="rent0"><td>{`Rent: $${place.rents[0]}`}</td></tr>
							<tr id="rent1"><td>{`2 railroads: $${place.rents[1]}`}</td></tr>
							<tr id="rent2"><td>{`3 railroads: $${place.rents[2]}`}</td></tr>
							<tr id="rent3"><td>{`4 railroads: $${place.rents[3]}`}</td></tr>
						</tbody>
					</table>
					<br id="mortgage-margin" />
					<div id="mortgage-value">{mortgageValue}</div>
				</div>;

			case Locations.ElectricCompany:
			case Locations.WaterWorks:
				// Display utility rents.
				return <div id="rent-table">
					<div id="price">{`Price: $${place.price}`}</div>
					<div id="owner-name">{this.getOwnerName(place.ownerNum)}</div>
					<br />
					<table>
						<tbody>
							<tr id="rent0"><td>One Utility: 4 times roll</td></tr>
							<tr id="rent1"><td>Both Utilities: 10 times roll</td></tr>
						</tbody>
					</table>
					<br id="mortgage-margin" />
					<div id="mortgage-value">{mortgageValue}</div>
				</div>;

			default:
				// Display house rents.
				return <div id="rent-table">
					<div id="price">{`Price: $${place.price}`}</div>
					<div id="owner-name">{this.getOwnerName(place.ownerNum)}</div>
					<br />
					<table>
					<tbody>
						<tr id="rent0"><td>{`Rent: $${place.rents[0]}`}</td></tr>
						<tr id="rent1"><td>{`With 1 House: $${place.rents[1]}`}</td></tr>
						<tr id="rent2"><td>{`With 2 Houses: $${place.rents[2]}`}</td></tr>
						<tr id="rent3"><td>{`With 3 Houses: $${place.rents[3]}`}</td></tr>
						<tr id="rent4"><td>{`With 4 Houses: $${place.rents[4]}`}</td></tr>
						<tr id="rent5"><td>{`With HOTEL: $${place.rents[5]}`}</td></tr>
					</tbody>
					</table>
					<br id="mortgage-margin" />
					<div id="mortgage-value">{mortgageValue}</div>
					<div id="price-per-house">{`$${place.housePrice} Per House`}</div>
				</div>;
		}
	}

	getOwnerName() {
		if (this.props.ownerName === "-unowned-") {
			return "Unowned";
		}

		return <span
			className="owner-name-clickable"
			onMouseOver={() => this.props.onMouseOverOwner(true)}
			onMouseOut={() => this.props.onMouseOverOwner(false)}
			onClick={() => this.props.onClickOwner()}>
			{`Owned by ${this.props.ownerName}`}
		</span>;
	}
}

LocationCard.propTypes = {
	placeIdx: PropTypes.number,
	ownerName: PropTypes.string,
	tax: PropTypes.number,
	onClickClose: PropTypes.func,
	onClickOwner: PropTypes.func,
	onMouseOverOwner: PropTypes.func
};

export default LocationCard;