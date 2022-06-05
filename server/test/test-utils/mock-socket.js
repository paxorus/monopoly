class MockIo {
	constructor() {
		this.sentMessages = [];
	}

	to(roomName) {
		this.roomName = roomName;
		return this;
	}

	emit(eventName, message) {
		this.sentMessages.push([eventName, message]);
	}

	clear() {
		this.sentMessages = [];
	}
}

class MockSocket {
	constructor() {
		this.registeredCallbacks = {};
		this.sentMessages = [];
	}

	on(eventName, callback) {
		this.registeredCallbacks[eventName] = callback;
	}

	join(roomName) {
		this.roomName = roomName;
	}

	emit(eventName, message) {
		this.sentMessages.push([eventName, message]);
	}

	receive(eventName, ...args) {
		return this.registeredCallbacks[eventName](...args);
	}
}

module.exports = {
	MockIo,
	MockSocket
};