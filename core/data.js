/**
 * In the future, all data should persist in a database, but still be cached here.
 */

let games = {
	"oiwftflpzyhsxjgarpla": {
		id: "oiwftflpzyhsxjgarpla",
		name: "my game",
		adminId: "heerffgylfgxuslpsujz",
		createTime: 1598213805058,
		hasStarted: false,
		hasCompleted: false,
		lobby: {}
	}
};

let users = {
	"heerffgylfgxuslpsujz": {
		secretKey: "icmufmqrjuybromognhx",
		gameIds: ["oiwftflpzyhsxjgarpla"]
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