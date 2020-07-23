import assert from "./assert.js";
import {showCard} from "../display-card.js";
import {GlobalState} from "../startup.js";

function justVisitingSpriteIds() {
	const verticalWalkwayOccupants = [...$("#jail-vertical-walkway").children()].map(x => x.id);
	const horizontalWalkwayOccupants = [...$("#jail-horizontal-walkway").children()].map(x => x.id);

	return [
		verticalWalkwayOccupants,
		horizontalWalkwayOccupants
	];
}

describe("Player", function () {

	describe("#updateBalance()", function () {
		it("should display the new balance", function () {
			GlobalState.me.updateBalance(500);
			assert.equal($("#bal0").text(), "$500");
		});
	});

	describe("#updateLocation()", function () {
		it("should wrap the players along the walkway", function () {
			const players = GlobalState.players;

			const sprites = players.map(player => player.buildSprite());
			$("#board").children().eq(0).append(sprites);

			players.forEach(player => player.updateLocation(10));

			assert.deepEqual(justVisitingSpriteIds(), [["marker0", "marker1", "marker2"], ["marker3", "marker4"]]);

			players[0].updateLocation(11);
			assert.deepEqual(justVisitingSpriteIds(), [["marker1", "marker2", "marker3"], ["marker4"]]);

			players[1].updateLocation(11);
			assert.deepEqual(justVisitingSpriteIds(), [["marker2", "marker3", "marker4"], []]);

			players[2].updateLocation(11);
			assert.deepEqual(justVisitingSpriteIds(), [["marker3", "marker4"], []]);

			players[3].updateLocation(11);
			assert.deepEqual(justVisitingSpriteIds(), [["marker4"], []]);

			players[4].updateLocation(11);
			assert.deepEqual(justVisitingSpriteIds(), [[], []]);

		});
	});

});
