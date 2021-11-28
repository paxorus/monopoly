const RADIUS = 23;
const OFFSET = 11;


function getMarginLeft(horizontalAlign) {
	switch (horizontalAlign) {
		case "center":
			return `-${RADIUS}px`;
		case "left":
			return `-${RADIUS + OFFSET}px`;
		case "right":
			return `-${RADIUS - OFFSET}px`;
	}
}

function getMarginTop(verticalAlign) {
	switch (verticalAlign) {
		case "center":
			return `-${RADIUS}px`;
		case "top":
			return `-${RADIUS + OFFSET}px`;
		case "bottom":
			return `-${RADIUS - OFFSET}px`;
	}
}

function getPositionStyle({mini, horizontalAlign, verticalAlign}) {
	if (mini) {
		return {
			float: "left"
		};
	} else {
		return {
			position: "absolute",
			left: "50%",
			top: "50%",
			marginLeft: getMarginLeft(horizontalAlign),
			marginTop: getMarginTop(verticalAlign)
		};
	}
}

const propTypes = {
	mini: PropTypes.bool,
	verticalAlign: PropTypes.oneOf(["center", "top", "bottom"]),
	horizontalAlign: PropTypes.oneOf(["center", "left", "right"])
};

export default {
	getPositionStyle,
	propTypes
};