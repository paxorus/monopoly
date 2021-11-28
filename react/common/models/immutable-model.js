class ImmutableModel {
	update(deltaObjectOrFunc) {
		const deltaObject = (typeof deltaObjectOrFunc === "function") ? deltaObjectOrFunc(this) : deltaObjectOrFunc;
		const copy = {...this, ...deltaObject};
		return Object.setPrototypeOf(copy, Object.getPrototypeOf(this));
	}
}

export default ImmutableModel;