class MessageBoxSingleton {
	constructor() {
		this.dom = document.getElementById("message-box");
	}

	clear() {
		this.dom.innerHTML = "";
	}

	log(message) {
		this.dom.innerHTML += message + "<br />";
	}
}

const MessageBox = new MessageBoxSingleton();
const log = message => MessageBox.log(message);

export {
	MessageBox,
	log
};