import validate from "/javascripts/validate-props.js";


class Modal extends React.Component {
	constructor(props) {
		validate(super(props));
		this.state = {
			percentOpen: props.isOpen ? 100 : 0
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// If isOpen became true.
		if (!prevProps.isOpen && this.props.isOpen) {
			this.slideIn();
		}
		// If isOpen became false.
		if (prevProps.isOpen && !this.props.isOpen) {
			this.slideOut();
		}
	}

	slideIn() {
		setTimeout(() => {
			this.setState((state, props) => {
				props.onModalSlide(state.percentOpen);
				if (state.percentOpen < 100) {
					this.slideIn();
				}
				return {
					percentOpen: state.percentOpen + 10
				};
			});
		}, 5);
	}

	slideOut() {
		setTimeout(() => {
			this.setState((state, props) => {
				props.onModalSlide(state.percentOpen);
				if (state.percentOpen > 0) {
					this.slideOut();
				}
				return {
					percentOpen: state.percentOpen - 10
				};
			});
		}, 5);
	}

	getTop(percentOpen) {
		const to = 20;
		const from = 100;
		return {
			top: `${(to - from) * percentOpen / 100 + from}%`,
			display: (percentOpen <= 0) ? "none" : "block"
		};
	}

	render() {
		return (
			<div className="form-modal" style={this.getTop(this.state.percentOpen)}>
				<div className="modal-header">
					<span>{this.props.title}</span>
					<img className="close-modal-x" src="/images/close-modal-x.svg" onClick={this.props.onClickCloseModal.bind(this)} />
				</div>
				{this.props.children}
			</div>
		);
	}
}

Modal.propTypes = {
	title: PropTypes.string,
	isOpen: PropTypes.bool,
	onModalSlide: PropTypes.func,
	onClickCloseModal: PropTypes.func,
	children: PropTypes.node
};

export default Modal;