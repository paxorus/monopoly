let io;

// TODO: This should only emit to players of a game, not everyone.
function configureEmitter(_io) {
	io = _io;
}

const emit = {
	all: (eventName, message) => io.emit(eventName, message)
};

module.exports = {
	configureEmitter,
	emit
};