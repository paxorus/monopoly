class InviteLink extends React.Component {
	constructor(props) {
		super(props);
		this.state = {copied: false};
	}

	handleClick() {
		const copyText = window.getSelection().selectAllChildren(document.querySelector("#game-link"));
		document.execCommand("copy");
		window.getSelection().removeAllRanges();
		this.setState({copied: true});
	}

	render() {
		return <div>
			<b>Invite friends by sharing this link:</b>
			<br />
			<div id="game-link">{location.href}</div>
			<div id="copy-game-link" className="button" style={{display: "inline-block"}} onClick={this.handleClick.bind(this)}>Copy</div>
			<div id="game-link-copy-status">{this.state.copied ? "Copied!" : ""}</div>
		</div>
	}
}

export default InviteLink;