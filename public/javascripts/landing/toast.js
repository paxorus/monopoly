function showToast(toastData) {
	if (toastData === null) {
		// No toast to show.
		return;
	}

	if (toastData.eventName === "toast:lobby-disbanded") {
		if (yourId === toastData.adminId) {
			new Toast(`Lobby ${toastData.lobbyName} was successfully deleted.`);
		} else {
			new Toast(`${toastData.adminId} deleted the game lobby "${toastData.lobbyName}".`);
		}
	}
}

class Toast {
	constructor(message) {
		this.message = message;
		const view = document.createElement("div");
		view.textContent = message;

		const closeButton = document.createElement("div");
		closeButton.textContent = "✖";
		closeButton.className = "toast-close-button";
		view.appendChild(closeButton);
		$(closeButton).click(() => this.hide());

		// Pause hide timeout when user hovers on toast.
		$(view).mouseover(() => clearTimeout(this.autoHideTimeout));
		$(view).mouseout(() => this.hideAfterTimeout());
		this.hideAfterTimeout();

		view.className = "toast";
		document.body.appendChild(view);
		this.view = view;
	}

	hide() {
		clearTimeout(this.autoHideTimeout);// User may interrupt the timeout by clicking "X".
		$(this.view).toggleClass("toast-hidden", true);
	}

	hideAfterTimeout() {
		clearTimeout(this.autoHideTimeout);
		this.autoHideTimeout = setTimeout(() => this.hide(), 3000);
	}
}

export {
	showToast
};