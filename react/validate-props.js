function validate(reactComponent) {
	const actualProps = reactComponent.props;
	const propTypes = Object.getPrototypeOf(reactComponent).constructor.propTypes;
	const componentName = Object.getPrototypeOf(reactComponent).constructor.name;

	if (propTypes === undefined) {
		console.warn(`${componentName}: Missing prop types`);
		return;
	}
	
	for (let propName in actualProps) {
		if (!(propName in propTypes)) {
			console.error(`${componentName}: Prop ${propName} was not expected`);
		}
	}

	for (let propName in propTypes) {
		if (!(propName in actualProps)) {
			console.warn(`${componentName}: Prop ${propName} was not provided`);
		}
	}
}

export default validate;