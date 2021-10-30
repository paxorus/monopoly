import validate from "/javascripts/validate-props.js";


class ModalPage extends React.Component {
	constructor(props) {
		validate(super(props));

		const anyModalInitiallyOpen = props.modals.some(modal => modal.isOpen);
		this.state = {
			percentBlur: anyModalInitiallyOpen ? 100 : 0
		};
	}

	handleModalSlide(percentOpen) {
		this.setState({percentBlur: percentOpen});
	}

	handleClickOverlay() {
		this.props.modals.forEach(modal => modal.onClose());
	}

	getPageBlurLevel(percentBlur) {
		const from = 0;
		const to = 10;
		return {filter: `blur(${(to - from) * percentBlur / 100 + from}px)`};
	}

	getOverlayOpacityLevel(percentBlur) {
		const from = 0;
		const to = 0.8;
		return {
			opacity: (to - from) * percentBlur / 100,
			zIndex: (percentBlur > 0) ? 2 : -1
		};
	}

	render() {
		return (
			<div>
				{/* Container for all content except the overlay and modal layer. */}
				<div style={this.getPageBlurLevel(this.state.percentBlur)}>
					{this.props.children}
				</div>

				{/* Overlay for modal */}
				<div className="full-page-overlay" style={this.getOverlayOpacityLevel(this.state.percentBlur)} onClick={this.handleClickOverlay.bind(this)}></div>

				{this.props.modals.map(modal => modal.build(this.handleModalSlide.bind(this)))}
			</div>
		);
	}
}

ModalPage.propTypes = {
	children: PropTypes.node,
	modals: PropTypes.arrayOf(PropTypes.exact({
		isOpen: PropTypes.bool,
		onClose: PropTypes.func,
		build: PropTypes.func
	}))
};

export default ModalPage;