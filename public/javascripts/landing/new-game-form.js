// Capture chosen sprite on click.
$(".player-icon").click(event => {
	const imgNode = event.target;
	$("#player-icon-hidden-field").val(imgNode.src.substring(window.location.origin.length));
	$(".player-icon").css("filter", "brightness(0.25)");
	$(imgNode.parentNode).css("filter", "brightness(1.0)");
});

// Don't reload page on input Enter or button click.
$("#new-game-form").submit(event => event.preventDefault());

// Validate the input as the user types.
$("#game-name-field").on("input", event => {
	const {isValid, reason} = isValidString(event.target.value);
	$("#create-game").toggleClass("button-disabled", ! isValid);
	$("#invalid-name-message").text(reason);
});

// Redden invalid reason if user leaves field.
$("#game-name-field").on("blur", event => {
	const reason = $("#invalid-name-message").text();
	if (reason !== "") {
		$("#invalid-name-message").toggleClass("invalid-field-message-aggressive", true);
	}
});

// Submit the form.
$("#create-game").click(event => {
	const gameName = $("#game-name-field").val();
	const adminDisplayName = $("#player-name-field").val();
	const adminSpriteSrc = $("#player-icon-hidden-field").val();

	const {isValid} = isValidString(gameName);
	if (isValid) {
		$.ajax({
			url: "/action/create-game",
			method: "POST",
			success: function(data) {
				location.href = `/game/${data.newGameId}`;
			},
			data: {
				gameName,
				adminDisplayName,
				adminSpriteSrc
			}
		});
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