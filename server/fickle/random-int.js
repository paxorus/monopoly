let injectedInt = undefined;

function getRandomInt(n) {
	return (injectedInt !== undefined) ? injectedInt : Math.floor(Math.random() * n);	
}

function _inject(int) {
	injectedInt = int;
}

function _uninject() {
	injectedInt = undefined;
}

module.exports = {
	getRandomInt,
	_inject,
	_uninject
};