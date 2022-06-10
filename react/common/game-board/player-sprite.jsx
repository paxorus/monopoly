import validate from "/javascripts/validate-props.js";


class PlayerSprite extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	render() {
		return <img className={`sprite-circle ${this.props.extraClasses.join(" ")}`}
			src={this.props.spriteFileName}
			onClick={this.props.onClick}
			onMouseOver={() => this.props.onMouseOver(true)}
			onMouseOut={() => this.props.onMouseOver(false)}
			style={{
				opacity: (this.props.faded ? 0.5 : 1),
				borderColor: this.props.borderColor,
				...this.props.extraStyle
			}} />;
	}
}

PlayerSprite.propTypes = {
	spriteFileName: PropTypes.string,
	borderColor: PropTypes.string,
	faded: PropTypes.bool,
	onClick: PropTypes.func,
	onMouseOver: PropTypes.func,
	extraClasses: PropTypes.arrayOf(PropTypes.string),
	extraStyle: PropTypes.object
};

PlayerSprite.defaultProps = {
	faded: false,
	extraClasses: [],
	extraStyle: {}
};

export default PlayerSprite;