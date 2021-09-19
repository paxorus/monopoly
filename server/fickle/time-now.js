let injectedTime = undefined;

function getTimeNow() {
	return (injectedTime !== undefined) ? injectedTime : +new Date();	
}

function _inject(time) {
	injectedTime = time;
}

function _uninject() {
	injectedTime = undefined;
}

module.exports = {
	getTimeNow,
	_inject,
	_uninject
};