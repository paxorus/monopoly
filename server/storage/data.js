/**
 * In the future, all data should persist in a database, but still be cached here.
 */

let games = {
	"oiwftflpzyhsxjgarpla": {
		id: "oiwftflpzyhsxjgarpla",
		name: "Friday night chillin",
		adminId: "heerffgylfgxuslpsujz",
		createTime: 1598213805058,
		numTurns: 25,
		lastUpdateTime: 1603492053331,
		hasStarted: true,
		hasCompleted: false,
		lobby: {},
		tax: 125,
		monopolies: [],
		placeRecords: [
			{placeIdx: 1, ownerNum: 0, houseCount: 2, isMortgaged: false},
			{placeIdx: 3, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 5, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 6, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 8, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 9, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 11, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 12, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 13, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 14, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 15, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 16, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 18, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 19, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 21, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 23, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 24, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 25, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 26, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 27, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 28, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 29, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 31, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 32, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 34, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 35, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 37, ownerNum: -1, houseCount: 0, isMortgaged: false},
			{placeIdx: 39, ownerNum: -1, houseCount: 0, isMortgaged: false}
		],
		currentPlayerId: 0,
		playerData: [
			{
				name: "Prakhar",
				userId: "heerffgylfgxuslpsujz",
				num: 0,
				spriteFileName: "https://cdn2.bulbagarden.net/upload/thumb/5/58/384Rayquaza-Mega.png/900px-384Rayquaza-Mega.png",
				latestRoll: null,
				rollCount: null,
				balance: 1500,
				placeIdx: 0,
				jailDays: null,
				numJailCards: 1,
				savedMessages: [
					["advance-turn", {nextPlayerId: 0}]
				]
			},
			{
				name: "Willy",
				userId: "nnkciawfaytxwwtxgxue",
				num: 1,
				spriteFileName: "https://cdn2.bulbagarden.net/upload/thumb/8/81/644Zekrom.png/375px-644Zekrom.png",
				latestRoll: null,
				rollCount: null,
				balance: 800,
				placeIdx: 6,
				jailDays: null,
				numJailCards: 0,
				savedMessages: [
					["advance-turn", {nextPlayerId: 1}],
					["log", "you already went, dude"]
				]
			}

		]
	},
	"oiwftflpzyhsxjgarplb": {
		id: "oiwftflpzyhsxjgarplb",
		name: "Saturday night chillin",
		adminId: "heerffgylfgxuslpsujz",
		createTime: 1598213805058,
		hasStarted: false,
		hasCompleted: false,
		lobby: {
			"heerffgylfgxuslpsujz": {
				name: "boop-star",
				sprite: "https://cdn2.bulbagarden.net/upload/archive/8/8a/20190407154255%21483Dialga.png"
			}
		}
	},
	"oiwftflpzyhsxjgarplc": {
		id: "oiwftflpzyhsxjgarplc",
		name: "Sunday night chillin",
		adminId: "heerffgylfgxuslpsujz",
		createTime: 1598213805058,
		hasStarted: false,
		hasCompleted: false,
		lobby: {
			"heerffgylfgxuslpsujz": {
				name: "boop-star",
				sprite: "https://cdn2.bulbagarden.net/upload/archive/8/8a/20190407154255%21483Dialga.png"
			}
		}
	}
};

let users = {
	"heerffgylfgxuslpsujz": {
		secretKey: "icmufmqrjuybromognhx",
		gameIds: ["oiwftflpzyhsxjgarpla", "oiwftflpzyhsxjgarplb", "oiwftflpzyhsxjgarplc"]
	},
	"nnkciawfaytxwwtxgxue": {
		secretKey: "eplwdiketejjznludrvq",
		gameIds: ["oiwftflpzyhsxjgarpla"]
	}
};

module.exports = {
	games,
	users
};