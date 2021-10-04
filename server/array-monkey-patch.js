Array.prototype.remove = function (x) {
	const idx = this.indexOf(x);
	if (idx !== -1) {
		this.splice(idx, 1);
	}
};
