const socket = io("/lobby");

socket.emit("open-lobby", {lobbyId});

socket.on("join-lobby", ({userId, name, sprite}) => addPlayerToList(userId, name, sprite));

socket.on("leave-lobby", ({userId}) => removePlayerFromList(userId));

socket.on("start-game", () => location.reload());

socket.on("return-to-landing-page", ({cookieKey, cookieValue}) => {
	document.cookie = `${cookieKey}=${encodeURIComponent(JSON.stringify(cookieValue))};max-age=24*60*60;samesite=strict;path=/`;
	location.href = "/";
});

socket.on("bad-player-id", () => {
	console.error("Server did not recognize player ID. :(");
});

socket.on("bad-secret-key", () => {
	console.error("Server recognized player ID but failed credentials. :(");
});


function addPlayerToList(playerId, name, spriteSrc) {
	// Add to list.
	const sprite = document.createElement("img");
	sprite.className = "lobby-player-sprite";
	sprite.src = spriteSrc;

	const spriteCircle = document.createElement("div");
	spriteCircle.className = "sprite-circle";
	spriteCircle.appendChild(sprite);

	const playerName = document.createElement("div");
	playerName.className = "lobby-player-name";
	playerName.textContent = name;

	if (playerId === myId) {
		const youLabel = document.createElement("span");
		youLabel.textContent = " (you)";
		playerName.style.backgroundColor = "#08F";
		playerName.appendChild(youLabel);
	}

	const row = document.createElement("div");
	row.appendChild(spriteCircle);
	row.appendChild(playerName);

	$("#joined-players").append(row);
	playerIds.push(playerId);
}

function removePlayerFromList(playerId) {
	// Remove from list.
	const index = playerIds.indexOf(playerId);

	$("#joined-players").children().eq(index).remove();
	playerIds.splice(index, 1);
}
