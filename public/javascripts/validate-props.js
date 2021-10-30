function validate(reactComponent) {
	var actualProps = reactComponent.props;
	var propTypes = Object.getPrototypeOf(reactComponent).constructor.propTypes;
	var componentName = Object.getPrototypeOf(reactComponent).constructor.name;

	if (propTypes === undefined) {
		console.warn(componentName + ": Missing prop types");
		return;
	}

	for (var propName in actualProps) {
		if (!(propName in propTypes)) {
			console.error(componentName + ": Prop " + propName + " was not expected");
		}
	}

	for (var _propName in propTypes) {
		if (!(_propName in actualProps)) {
			console.warn(componentName + ": Prop " + _propName + " was not provided");
		}
	}
}

export default validate;