let injectedTime = [];

function getTimeNow() {
	return (injectedTime.length > 0) ? injectedTime.shift() : +new Date();	
}

function _inject(...time) {
	injectedTime = [...time];
}

export default {
	getTimeNow,
	_inject
};