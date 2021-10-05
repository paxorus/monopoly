let injectedInts = [];

/**
 * Choose a random integer from [a, b] with uniform probability.
 */
function fromRange(a, b) {
	if (injectedInts.length > 0) {
		return injectedInts.shift();
	}

	return Math.floor(Math.random() * (b - a + 1)) + a;
}

/**
 * Choose a random integer from [0, n-1] with uniform probability.
 */
function upto(n) {
	return (injectedInts.length > 0) ? injectedInts.shift() : Math.floor(Math.random() * n);
}

// Allow tester to inject a series of integers. Overwriting instead of appending prevents an extra integer
// from domino-effecting all following tests.
function _inject(...ints) {
	injectedInts = ints;
}

module.exports = {
	fromRange,
	upto,
	_inject
};