class AssertionError extends Error {
	constructor(actual, expected, ...params) {
		super(...params)

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AssertionError)
		}

		this.name = "AssertionError";
		this.date = new Date();
		this.actual = actual;
		this.expected = expected;
		this.message = `expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`;
	}
}

function deepEquals(actual, expected) {
	if (Array.isArray(actual) && Array.isArray(expected)) {
		return deepArrayEquals(actual, expected);
	}
	if (typeof actual === "object" && typeof expected === "object") {
		return deepObjectEquals(actual, expected);
	}
	return actual === expected;
}

function deepArrayEquals(actual, expected) {
	return actual.length === expected.length && actual.every((item, idx) => deepEquals(item, expected[idx]));
}

function deepObjectEquals(actual, expected) {
	const actualEntries = Object.entries(actual);
	const expectedEntries = Object.entries(expected);
	return actualEntries.length === expectedEntries.length
		&& actualEntries.every(([key, value]) => deepEquals(value, expected[key]));
}

const assert = {
	equal: function (actual, expected) {
		if (actual !== expected) {
			throw new AssertionError(actual, expected);
		}
	},
	deepEqual: function (actual, expected) {
		if (! deepEquals(actual, expected)) {
			throw new AssertionError(actual, expected);
		}
	},

};

// Grant access to browser console.
window.assert = assert;

export default assert;