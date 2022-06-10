import validate from "/javascripts/validate-props.js";


class TextInput extends React.Component {
	constructor(props) {
		validate(super(props));
		this.state = {
			isEditing: false
		};
	}

	handleChange(event) {
		event.preventDefault();
		this.props.onChange(event.target.value);
	}

	render() {
		return (
			<div>
				<span>{this.props.prompt}</span>
				<input className="text-input inline left-margin" type="text" placeholder={this.props.placeholder} value={this.props.value}
					onChange={this.handleChange.bind(this)}
					onFocus={() => this.setState({isEditing: true})}
					onBlur={() => this.setState({isEditing: false})} />
				<div className={`invalid-field-message ${this.state.isEditing ? "" : "invalid-field-message-aggressive"}`}>{this.props.getValidationComplaint()}</div>
			</div>
		);
	}
}

TextInput.propTypes = {
	prompt: PropTypes.string,
	placeholder: PropTypes.string,
	value: PropTypes.string,
	getValidationComplaint: PropTypes.func,
	onChange: PropTypes.func
};

export default TextInput;