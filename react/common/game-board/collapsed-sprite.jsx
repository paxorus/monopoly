import validate from "/javascripts/validate-props.js";
import SpritePositionUtil from "/javascripts/common/game-board/sprite-position-util.js";


class CollapsedSprite extends React.Component {
	constructor(props) {
		validate(super(props));

		this.state = {
			isTooltipOpen: false
		}
	}

	handleClick(event) {
		event.stopPropagation();// Don't propagate player click to square.
		this.setState(state => ({
			isTooltipOpen: !state.isTooltipOpen
		}));
	}

	render() {
		const isMiniClass = this.props.mini ? "sprite-circle-mini" : "";
		return <div className={`collapsed-sprite ${isMiniClass}`}
			style={SpritePositionUtil.getPositionStyle(this.props)}
			onClick={this.handleClick.bind(this)}>
			{`+${this.props.children.length}`}
			{this.state.isTooltipOpen && <div className="sprites-expanded-tooltip">{this.props.children}</div>}
		</div>;
	}
}

CollapsedSprite.propTypes = {
	children: PropTypes.arrayOf(PropTypes.element),
	...SpritePositionUtil.propTypes
};

CollapsedSprite.defaultProps = {
	mini: false
}

export default CollapsedSprite;