import validate from "/javascripts/validate-props.js";


class PlayerSprite extends React.Component {
	constructor(props) {
		validate(super(props));
	}

	render() {
		return <img className="circ" src={this.props.spriteFileName} style={{opacity: (this.props.faded ? 0.5 : 1) }} />;
	}
}

PlayerSprite.propTypes = {
	faded: PropTypes.bool,
	spriteFileName: PropTypes.string
};

PlayerSprite.defaultProps = {
	faded: false
};

export default PlayerSprite;