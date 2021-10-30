import validate from "/javascripts/validate-props.js";


class ImagePicker extends React.Component {
	constructor(props) {
		validate(super(props));
		this.state = {
			mousedOverImage: null
		};
	}

	handleMouseOverImage(sprite) {
		this.setState({mousedOverImage: sprite});
	}

	handleMouseOutOfImage(sprite) {
		this.setState({mousedOverImage: null});
	}

	shouldHighlightImage(imageUrl) {
		return this.props.selectedImage === imageUrl || this.state.mousedOverImage === imageUrl;
	}

	render() {
		return (
			<div>{this.props.imageUrls.map(imageUrl =>
					<div className="player-icon" key={imageUrl} style={{filter: (this.shouldHighlightImage(imageUrl) ? "brightness(1.0)" : "brightness(0.25)")}}>
						<center><img src={imageUrl} style={{maxHeight: "100px", maxWidth: "100px"}}
							onClick={() => this.props.onClickImage(imageUrl)}
							onMouseOver={() => this.handleMouseOverImage(imageUrl)}
							onMouseOut={() => this.handleMouseOutOfImage()}
						/></center>
					</div>
				)}
			</div>
		);
	}
}

ImagePicker.propTypes = {
	imageUrls: PropTypes.arrayOf(PropTypes.string),
	selectedImage: PropTypes.string,
	onClickImage: PropTypes.func
};

export default ImagePicker;