import AgeToTextHelper from "/javascripts/common/friendliness/age-to-text-helper.js";
import {Place} from "/javascripts/common/models/place.js";
import {PlaceConfigs} from "/javascripts/gameplay/location-configs.js";
import validate from "/javascripts/validate-props.js";


class TradeDetails extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	render() {
		return <div style={{gridRow: 2, display: "grid", marginLeft: "20px"}}>
			<div>
				<div className="label">From</div>
				{this.props.fromPlayerName}
			</div>
			<div title={new Date(this.props.offerCreateTime).toLocaleString()} style={{gridColumn: 1}}>
				<div className="label">Received</div>
				{AgeToTextHelper.describeTimeSince(this.props.offerCreateTime)}
			</div>
			<div style={{gridRow: "1 / span 2", gridColumn: 2}}>
				<div className="label">Message</div>
				{this.props.offerMessage}
			</div>
			<div style={{gridRow: "1 / span 2", gridColumn: 3}}>
				<div className="vertical-align">
					<div className="button" onClick={this.props.onClickAcceptOffer}>Accept Offer</div>
					<div style={{height: "10px"}}></div>
					<div className="button-secondary" onClick={this.props.onClickDeclineOffer}>Decline Offer</div>
				</div>
			</div>
		</div>
	}
}

TradeDetails.propTypes = {
	fromPlayerName: PropTypes.string,
	offerMessage: PropTypes.string,
	offerCreateTime: PropTypes.number,
	onClickAcceptOffer: PropTypes.func,
	onClickDeclineOffer: PropTypes.func
};

export default TradeDetails;