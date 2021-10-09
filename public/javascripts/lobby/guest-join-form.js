// Capture chosen sprite on click.
$(".player-icon").click(event => {
	const imgNode = event.target;
	$("#player-icon-hidden-field").val(imgNode.src);
	$(".player-icon").css("filter", "brightness(0.25)");
	$(imgNode.parentNode).css("filter", "brightness(1.0)");
});

// Don't reload page on input Enter or button click.
// $("#new-game-form").submit(event => event.preventDefault());

// Submit the form.
$("#join-game").click(event => {
	const name = $("#player-name-field").val();
	const sprite = $("#player-icon-hidden-field").val();

	const {isValid} = isValidString(name);
	if (isValid) {
		socket.emit("join-lobby", {name, sprite});
		joinGameCallback();
	}
});

function isValidString(input) {
	// TODO: URL-unsafe characters like forward-slash
	if (input.length < 5 || input.length > 50) {
		return {isValid: false, reason: "Name must be 5-50 characters long."};
	}

	for (let i = 0; i < input.length; i ++) {
		const charCode = input.charCodeAt(i);
		if (charCode < 32 || charCode > 126) {
			return {isValid: false, reason: "Invalid character, only alphanumeric and common symbols are allowed."};
		}
	}

	return {isValid: true, reason: ""}
}

let joinGameCallback = () => {};

function onJoinGame(_callback) {
	joinGameCallback = _callback;	
}

export {
	onJoinGame
};