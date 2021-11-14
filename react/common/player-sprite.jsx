import validate from "/javascripts/validate-props.js";


class PlayerSprite extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	render() {
		return <img className="circ"
			src={this.props.spriteFileName}
			onClick={this.props.onClick}
			onMouseOver={() => this.props.onMouseOver(true)}
			onMouseOut={() => this.props.onMouseOver(false)}
			style={{opacity: (this.props.faded ? 0.5 : 1) }} />;
	}
}

PlayerSprite.propTypes = {
	faded: PropTypes.bool,
	spriteFileName: PropTypes.string,
	onClick: PropTypes.func,
	onMouseOver: PropTypes.func
};

PlayerSprite.defaultProps = {
	faded: false
};

export default PlayerSprite;