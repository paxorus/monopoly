let injectedInt = [];

function getRandomInt(n) {
	return (injectedInt.length > 0) ? injectedInt.shift() : Math.floor(Math.random() * n);	
}

function _inject(...ints) {
	injectedInt = ints;
}

function _uninject() {
	// injectedInt = [];
}

module.exports = {
	getRandomInt,
	_inject,
	_uninject
};