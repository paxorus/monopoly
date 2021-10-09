import {openModal, closeModal} from "/javascripts/common/modal-animation.js";
import {onJoinGame} from "/javascripts/lobby/guest-join-form.js";


/**
 * Copy game link.
 */
$("#game-link").val(location.href);
$("#copy-game-link").click(event => {
	const copyText = document.querySelector("#game-link");
	copyText.select();
	document.execCommand("copy");
	$("#game-link-copy-status").text("Copied!");
});

/*
 * Guest: Join or Leave Game.
 */
const modalElements = {
	modal: $("#guest-join-modal"),
	overlay: $("#full-page-overlay"),
	container: $("#page-container")
};

$("#close-modal-x").click(event => closeModal(modalElements));

$("#join-leave-game").click(event => {
	if (hasJoinedGame) {
		// Leave lobby
		socket.emit("leave-lobby");
		$("#join-leave-game").text("Join Game");
		$("#join-leave-game").toggleClass("button-secondary", false);
		hasJoinedGame = false;
	} else {
		// Open modal to join lobby
		openModal(modalElements);
	}
});

// Guest: Once modal is submitted
onJoinGame(() => {
	$("#join-leave-game").text("Leave Game");
	$("#join-leave-game").toggleClass("button-secondary", true);
	hasJoinedGame = true;
	closeModal(modalElements);
});

/**
 * Admin: Start Game.
 */
$("#start-game").click(event => {
	// This will reload the page for all users.
	socket.emit("convert-to-game");
});

/**
 * Admin: Disband Lobby.
 */
$("#disband-lobby").click(event => {
	socket.emit("disband-lobby");
});
